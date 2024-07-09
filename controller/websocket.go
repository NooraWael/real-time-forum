package controller

import (
	"fmt"
	"forum/model"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// Upgrader upgrades HTTP connections to WebSocket connections.
var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool {
        return true // Allow connections from any origin.
    },
}

var users = make(map[*websocket.Conn]string)

// handleConnections handles incoming WebSocket connections.
// handleConnections handles incoming WebSocket connections.
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

    fmt.Println(msg)

    switch msg["type"] {
    case "register":
        users[ws] = msg["username"]
        broadcastUserList()

        // Load message history between users
        sender := msg["username"]
        recipient := msg["recipient"] // Assuming recipient username is sent during registration
        log.Printf("Sender: %s, Recipient: %s", sender, recipient)
        messages, err := model.GetMessageHistory(sender, recipient)
        fmt.Println(messages)
        if err != nil {
            log.Printf("error retrieving message history: %v", err)
        } else {
            for _, message := range messages {
                messageMap := map[string]string{
                    "type": "message",
                    "from": message.Sender,
                    "text": message.Content,
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
            delete(users, ws)
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

        case "disconnect":
            delete(users, ws)
            broadcastUserList()
        }
    }
}

// getUserConnByUsername returns the WebSocket connection for a given username.
func getUserConnByUsername(username string) *websocket.Conn {
    for conn, user := range users {
        if user == username {
            return conn
        }
    }
    return nil
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
        delete(users, conn)
    }
}

// broadcastUserList broadcasts the list of online users to all connections.
func broadcastUserList() {
    userList := make([]string, 0, len(users))
    for _, user := range users {
        userList = append(userList, user)
    }
    for conn := range users {
        if err := conn.WriteJSON(map[string]interface{}{
            "type":  "userList",
            "users": userList,
        }); err != nil {
            log.Printf("error: %v", err)
            conn.Close()
            delete(users, conn)
        }
    }
}
