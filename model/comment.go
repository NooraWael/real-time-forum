package model

import (
	"database/sql"
	"time"
)

type Comment struct {
	ID         int
	PostID     int
	Author     string
	Content    string
	Likes      int
	DisLikes   int
	Created_At time.Time
}

func (c *Comment) Create() (err error) {
	stmt, err := DB.Prepare(`INSERT INTO comments (post_id, author, content, likes, dislikes)
    VALUES (?, ?, ?, ?, ?)`)
	if err != nil {
		return
	}
	_, err = stmt.Exec(c.PostID, c.Author, c.Content, c.Likes, c.DisLikes)
	if err != nil {
		return
	}
	return
}

func (c *Comment) Update() (err error) {
	stmt, err := DB.Prepare(`UPDATE comments SET author=? content=? likes=? dislikes=? WHERE comment_id=?`)
	if err != nil {
		return
	}

	_, err = stmt.Exec(c.Author, c.Content, c.Likes, c.DisLikes, c.ID)
	if err != nil {
		return
	}

	return
}

func NewComment(postID int, author, content string) *Comment {
	return &Comment{
		PostID:    postID,
		Author:    author,
		Content:   content,
		Likes:     0,
		DisLikes:  0,
		Created_At: time.Now(),
	}
}

func GetComment(id int) (comment Comment, err error) {
	comment = Comment{}
	stmt, err := DB.Prepare(`SELECT * FROM comments WHERE comment_id=?`)
	if err != nil {
		return
	}
	err = stmt.QueryRow(id).Scan(&comment.ID, &comment.PostID, &comment.Author, &comment.Content, &comment.Likes, &comment.DisLikes, &comment.Created_At)
	return
}

func GetPostComments(postID int) (comments []Comment, err error) {
	comments = []Comment{}
	var rows *sql.Rows

	stmt, err := DB.Prepare(`SELECT * FROM comments WHERE post_id=?`)
	if err != nil {
		return
	}

	rows, err = stmt.Query(postID)
	if err != nil {
		return
	}

	defer rows.Close()

	for rows.Next() {
		comment := Comment{}
		err = rows.Scan(&comment.ID, &comment.PostID, &comment.Author, &comment.Content, &comment.Likes, &comment.DisLikes, &comment.Created_At)
		if err != nil {
			return
		}
		comments = append(comments, comment)
	}

	return
}
