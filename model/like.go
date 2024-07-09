package model

import (
	"database/sql"
	"fmt"
)

type Like struct {
	ID        int
	PostID    int
	CommentID int
	UserName  string
	Type      bool
}

func GetLike(post_id int, username string) (like *Like, err error) {
	like = &Like{}

	stmt, err := DB.Prepare(`SELECT * FROM likes WHERE post_id=? AND username=?`)
	if err != nil {
		return
	}

	var cid sql.NullInt64
	err = stmt.QueryRow(post_id, username).Scan(&like.ID, &like.PostID, &cid, &like.UserName, &like.Type)
	if err != nil {
		return nil, err
	}

	if cid.Valid {
		like.CommentID = int(cid.Int64)
	} else {
		like.CommentID = 0
	}

	return
}

func AddPostLike(post_id int, username string, liketype string) (err error) {
	stmt, err := DB.Prepare(`INSERT INTO likes (post_id, username, isLike) VALUES (?, ?, ?)`)
	if err != nil {
		return
	}

	var option bool
	if liketype == "like" {
		option = true
	} else {
		option = false
	}

	_, err = stmt.Exec(post_id, username, option)
	if err != nil {
		return
	}

	return
}

func RemoveLike(likeID int) (err error) {
	stmt, err := DB.Prepare(`DELETE FROM likes WHERE id=?`)
	if err != nil {
		return
	}

	_, err = stmt.Exec(likeID)
	if err != nil {
		return
	}

	return
}

func (l *Like) Toggle() (err error) {
	l.Type = !l.Type

	stmt, err := DB.Prepare(`UPDATE likes SET isLike=? WHERE id=?`)
	if err != nil {
		return err
	}

	_, err = stmt.Exec(l.Type, l.ID)
	return
}

func GetLikeComment(postID int, commentID int, username string) (*Like, error) {
	var like Like
	query := `SELECT id, post_id, comment_id, username, isLike 
              FROM likes 
              WHERE post_id = ? AND comment_id = ? AND username = ?`

	err := DB.QueryRow(query, postID, commentID, username).Scan(&like.ID, &like.PostID, &like.CommentID, &like.UserName, &like.Type)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no like found")
		}
		return nil, err
	}

	return &like, nil
}

func AddCommentLike(postID int, commentID int, username string, likeType string) error {
	isLike := false
	if likeType == "like" {
		isLike = true
	}

	query := `INSERT INTO likes (post_id, comment_id, username, isLike) VALUES (?, ?, ?, ?)`
	_, err := DB.Exec(query, postID, commentID, username, isLike)
	if err != nil {
		return err
	}

	return nil
}
