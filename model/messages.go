package model

import (
	"database/sql"
	"sort"
	"strings"
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

func GetMessageHistoryUser(sender string, recipients []string) ([][2]string, error) {

    var messagePairs [][2]string

    for _, recipient := range recipients {
        var messageContent string
        err := DB.QueryRow(`
            SELECT content FROM messages 
            WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?) 
            ORDER BY sent_at DESC 
            LIMIT 1`,
            sender, recipient, recipient, sender,
        ).Scan(&messageContent)
        
        if err != nil {
            if err == sql.ErrNoRows {
                messagePairs = append(messagePairs, [2]string{recipient, "None"})
            } else {
                return nil, err
            }
        } else {
            messagePairs = append(messagePairs, [2]string{recipient, messageContent})
        }
    }

    return messagePairs, nil
}


/* This function adds a new message to the messages table. */
func (m *Message) Create() error {
	stmt, err := DB.Prepare(`INSERT INTO messages (sender, recipient, content, sent_at, is_read) VALUES (?, ?, ?, ?, ?)`)
	if err != nil {
		return err
	}
    location, err := time.LoadLocation("Europe/Moscow") // GMT+3
    if(strings.TrimSpace(m.Sender) == "" || strings.TrimSpace(m.Recipient) == "" ){
        return nil
    }
    m.SentAt = m.SentAt.In(location)
	_, err = stmt.Exec(m.Sender, m.Recipient, m.Content, m.SentAt.Format("2006-01-02 15:04:05"), m.IsRead)
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

func GetMessageHistoryUserArranged(sender string, recipients []string) ([][3]string, error) {
	type messageInfo struct {
		Recipient    string
		Content      string
		HasMessage   bool
		LastSentTime time.Time
	}

	var messageInfos []messageInfo

	for _, recipient := range recipients {
		var messageContent string
		var sentAt time.Time
		err := DB.QueryRow(`
			SELECT content, sent_at FROM messages 
			WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?) 
			ORDER BY sent_at DESC 
			LIMIT 1`,
			sender, recipient, recipient, sender,
		).Scan(&messageContent, &sentAt)

		if err != nil {
			if err == sql.ErrNoRows {
				messageInfos = append(messageInfos, messageInfo{Recipient: recipient, Content: "None", HasMessage: false})
			} else {
				return nil, err
			}
		} else {
			messageInfos = append(messageInfos, messageInfo{Recipient: recipient, Content: messageContent, HasMessage: true, LastSentTime: sentAt})
		}
	}

	// Separate recipients with and without messages
	var withMessages, withoutMessages []messageInfo
	for _, info := range messageInfos {
		if info.HasMessage {
			withMessages = append(withMessages, info)
		} else {
			withoutMessages = append(withMessages, info)
		}
	}

	// Manually sort withMessages by LastSentTime (latest to earliest)
	for i := 1; i < len(withMessages); i++ {
		key := withMessages[i]
		j := i - 1
		for j >= 0 && withMessages[j].LastSentTime.Before(key.LastSentTime) {
			withMessages[j+1] = withMessages[j]
			j = j - 1
		}
		withMessages[j+1] = key
	}

	// Sort without messages alphabetically by Recipient
	sort.Slice(withoutMessages, func(i, j int) bool {
		return withoutMessages[i].Recipient < withoutMessages[j].Recipient
	})

	// Combine sorted lists
	var sortedMessagePairs [][3]string
	for _, info := range withMessages {
		sortedMessagePairs = append(sortedMessagePairs, [3]string{info.Recipient, info.Content, info.LastSentTime.Format(time.RFC3339)})
	}
	for _, info := range withoutMessages {
		sortedMessagePairs = append(sortedMessagePairs, [3]string{info.Recipient, info.Content, ""})
	}
	
	return sortedMessagePairs, nil
}
