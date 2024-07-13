package controller

import (
	"forum/model"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
    upgrader = websocket.Upgrader{
        ReadBufferSize:  1024,
        WriteBufferSize: 1024,
        CheckOrigin: func(r *http.Request) bool {
            return true // Allow connections from any origin.
        },
    }
    // Mutex for synchronizing access to user connections
    mu sync.Mutex
    // Map to store WebSocket connections by username
    userConnections = make(map[string]*websocket.Conn)
)

func handleConnections(w http.ResponseWriter, r *http.Request) {
    ws, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
        return
    }
    defer ws.Close()

    // Register user
    var msg map[string]string
    err = ws.ReadJSON(&msg)
    if err != nil {
        log.Printf("error: %v", err)
        return
    }


    switch msg["type"] {
    case "register":
        username := msg["username"]
        mu.Lock()
        userConnections[username] = ws
        mu.Unlock()

        broadcastUserList()

        // Load message history between users
        sender := msg["username"]
        recipient := msg["recipient"] // Assuming recipient username is sent during registration
        messages, err := model.GetMessageHistory(sender, recipient)
        if err != nil {
            log.Printf("error retrieving message history: %v", err)
        } else {
            for _, message := range messages {
                messageMap := map[string]string{
                    "type": "message",
                    "from": message.Sender,
                    "text": message.Content,
                    "type2": "history",
                }
                if err := ws.WriteJSON(messageMap); err != nil {
                    log.Printf("error sending message history: %v", err)
                    return
                }
            }
        }

    default:
        log.Println("Invalid message type during registration")
        return
    }

    // Handle incoming messages
    for {
        err := ws.ReadJSON(&msg)
        if err != nil {
            log.Printf("error: %v", err)
            mu.Lock()
            delete(userConnections, msg["username"])
            mu.Unlock()
            break
        }

        switch msg["type"] {
        case "message":
            recipientUsername := msg["to"]
            recipientConn := getUserConnByUsername(recipientUsername)

            if recipientConn != nil {
                sendMessage(recipientConn, msg["from"], msg["text"])
            }

            sendMessage(ws, msg["from"], msg["text"])

            // Store message in database
            err := model.SaveMessage(msg["from"], msg["to"], msg["text"])
            if err != nil {
                log.Printf("error saving message to database: %v", err)
                // Handle error appropriately (e.g., inform users)
            }

        case "typing":
            recipientUsername := msg["to"]
            recipientConn := getUserConnByUsername(recipientUsername)
            if recipientConn != nil {
                sendTypingStatus(recipientConn, msg["from"], msg["status"])
            }


        case "disconnect":
            mu.Lock()
            delete(userConnections, msg["username"])
            mu.Unlock()
            broadcastUserList()
        }
    }
}

// getUserConnByUsername returns the WebSocket connection for a given username.
func getUserConnByUsername(username string) *websocket.Conn {
    mu.Lock()
    defer mu.Unlock()
    return userConnections[username]
}

// sendMessage sends a message to a WebSocket connection.
func sendMessage(conn *websocket.Conn, from, text string) {
    message := map[string]string{
        "type": "message",
        "from": from,
        "text": text,
    }
    if err := conn.WriteJSON(message); err != nil {
        log.Printf("error: %v", err)
        conn.Close()
        mu.Lock()
        defer mu.Unlock()
        delete(userConnections, getUsernameByConn(conn))
    }
}

// broadcastUserList broadcasts the list of online users to all connections.
func broadcastUserList() {
    mu.Lock()
    defer mu.Unlock()
    userList := make([]string, 0, len(userConnections))
    for username := range userConnections {
        userList = append(userList, username)
    }
    for _, conn := range userConnections {
        if err := conn.WriteJSON(map[string]interface{}{
            "type":  "userList",
            "users": userList,
        }); err != nil {
            log.Printf("error: %v", err)
            conn.Close()
            mu.Lock()
            defer mu.Unlock()
            delete(userConnections, getUsernameByConn(conn))
        }
    }
}

// getUsernameByConn retrieves the username associated with a WebSocket connection.
func getUsernameByConn(conn *websocket.Conn) string {
    mu.Lock()
    defer mu.Unlock()
    for username, connection := range userConnections {
        if connection == conn {
            return username
        }
    }
    return ""
}


// sendTypingStatus sends a typing status to a WebSocket connection.
func sendTypingStatus(conn *websocket.Conn, from, status string) {
    message := map[string]string{
        "type": "typing",
        "from": from,
        "status": status,
    }
    if err := conn.WriteJSON(message); err != nil {
        log.Printf("error: %v", err)
        conn.Close()
        mu.Lock()
        defer mu.Unlock()
        delete(userConnections, getUsernameByConn(conn))
    }
}
