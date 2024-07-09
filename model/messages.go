package model

import (
	"fmt"
	"time"
)

type Message struct {
	ID        int
	Sender    string
	Recipient string
	Content   string
	SentAt    time.Time
	IsRead    bool
}

/* This function creates a new message struct instance and returns it populated with an ID, sender, recipient, content, timestamp, and read status. */
func NewMessage(sender, recipient, content string) (*Message, error) {
	var nextID int
	err := DB.QueryRow("SELECT IFNULL(MAX(id), 0) + 1 FROM messages").Scan(&nextID)
	if err != nil {
		return nil, err
	}
	return &Message{
		ID:        nextID,
		Sender:    sender,
		Recipient: recipient,
		Content:   content,
		SentAt:    time.Now(),
		IsRead:    false,
	}, nil
}

/* This function adds a new message to the messages table. */
func (m *Message) Create() error {
	stmt, err := DB.Prepare(`INSERT INTO messages (sender, recipient, message, sent_at, is_read) VALUES (?, ?, ?, ?, ?)`)
	if err != nil {
		return err
	}
	_, err = stmt.Exec(m.Sender, m.Recipient, m.Content, m.SentAt, m.IsRead)
	if err != nil {
		return err
	}
	return nil
}

/* This function retrieves a message from the database by ID. */
func GetMessageByID(id int) (*Message, error) {
	m := &Message{}
	err := DB.QueryRow("SELECT * FROM messages WHERE id = ?", id).Scan(&m.ID, &m.Sender, &m.Recipient, &m.Content, &m.SentAt, &m.IsRead)
	if err != nil {
		return nil, err
	}
	return m, nil
}

/* This function marks a message as read in the database. */
func MarkMessageAsRead(id int) error {
	stmt, err := DB.Prepare("UPDATE messages SET is_read = ? WHERE id = ?")
	if err != nil {
		return err
	}
	_, err = stmt.Exec(true, id)
	if err != nil {
		return err
	}
	return nil
}


// SaveMessage saves a message to the database.
func SaveMessage(sender, recipient, content string) error {
    message := &Message{
        Sender:    sender,
        Recipient: recipient,
        Content:   content,
        SentAt:    time.Now(),
        IsRead:    false, // Assuming messages are initially unread
    }

    // Save message to database
    err := message.Create()
    if err != nil {
        return err
    }
    return nil
}

// GetMessageHistory retrieves message history between two users from the database.
func GetMessageHistory(sender, recipient string) ([]*Message, error) {
    // Implement database query to retrieve message history
    // Example query:
	fmt.Println("hello")
	fmt.Println(sender)
	fmt.Println(recipient)
    rows, err := DB.Query(`SELECT * FROM messages WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?) ORDER BY sent_at`, sender, recipient, recipient, sender)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var messages []*Message
    for rows.Next() {
        var message Message // Use local variable to scan into
        if err := rows.Scan(&message.ID, &message.Sender, &message.Recipient, &message.Content, &message.SentAt, &message.IsRead); err != nil {
            return nil, err
        }
        messages = append(messages, &message)
    }

    if err := rows.Err(); err != nil {
        return nil, err
    }

    return messages, nil
}