package model

import (
	"database/sql"
	"strings"
	"time"
)

type Post struct {
	ID             int
	Author         string
	Title          string
	Content        string
	Likes          int
	DisLikes       int
	Created_At     time.Time
	UserLikeStatus int
	Categories     []string
}

/* This method adds post to the table and returns error in case of any database error. */
func (p *Post) Create() (id int, err error) {
	stmt, err := DB.Prepare(`INSERT INTO posts (author, title, content, likes, dislikes)
    VALUES (?, ?, ?, ?, ?)`)
	if err != nil {
		return
	}

	res, err := stmt.Exec(p.Author, p.Title, p.Content, p.Likes, p.DisLikes)
	if err != nil {
		return
	}

	var id64 int64
	id64, err = res.LastInsertId()
	if err != nil {
		return
	}

	id = int(id64)
	return
}

/* This method updates the table with all new post details. */
func (p *Post) Update() (err error) {
	stmt, err := DB.Prepare(`UPDATE posts SET author=? title=? content=? likes=? dislikes=? WHERE post_id=?`)
	if err != nil {
		return
	}

	_, err = stmt.Exec(p.Author, p.Title, p.Content, p.Likes, p.DisLikes, p.ID)
	if err != nil {
		return
	}

	return
}

/* This function creates the post struct and populates it with Author, Title & Post content. */
func NewPost(author, title, content string) *Post {
	return &Post{
		Author:  author,
		Title:   title,
		Content: content,
	}
}

func GetPost(id int) (post Post, err error) {
	post = Post{}
	stmt, err := DB.Prepare(`SELECT * FROM posts WHERE post_id=?`)
	if err != nil {
		return
	}
	err = stmt.QueryRow(id).Scan(&post.ID, &post.Author, &post.Title, &post.Content, &post.Likes, &post.DisLikes, &post.Created_At)
	return
}

func GetPosts(userID string) ([]Post, error) {
	posts := []Post{}
	//need to get posts and if liked + disliked order by date
	query := `
        SELECT p.post_id, p.author, p.title, p.content, p.likes, p.dislikes, p.created_at,
               COALESCE(l.isLike, -1) as user_like_status
        FROM posts p
        LEFT JOIN (SELECT * FROM likes WHERE username = ?) l
        ON p.post_id = l.post_id AND l.comment_id IS NULL
        ORDER BY p.created_at DESC`

	rows, err := DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post Post
		var createdAt time.Time
		var userLikeStatus int
		if err := rows.Scan(&post.ID, &post.Author, &post.Title, &post.Content, &post.Likes, &post.DisLikes, &createdAt, &userLikeStatus); err != nil {
			return nil, err
		}

		formattedTime := createdAt.In(time.FixedZone("GMT+3", 3*60*60)).Format("02/01/2006 03:04 PM")

		// Convert formattedTime back to time.Time using time.Parse
		post.Created_At, err = time.Parse("02/01/2006 03:04 PM", formattedTime)
		if err != nil {
			return nil, err
		}

		post.UserLikeStatus = userLikeStatus
		posts = append(posts, post)

	}

	return posts, nil
}

func GetPostsByUser(username string) (posts []Post, err error) {
	rows, err := DB.Query(`SELECT * FROM posts WHERE author = ?`, username)
	if err != nil {
		return
	}
	defer rows.Close()

	posts = []Post{}
	for rows.Next() {
		var post Post
		if err := rows.Scan(&post.ID, &post.Author, &post.Title, &post.Content, &post.Likes, &post.DisLikes, &post.Created_At); err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	return
}
func UpdatePost(post Post) (err error) {
	stmt, err := DB.Prepare(`UPDATE posts SET title = ?, content = ? WHERE post_id = ?`)
	if err != nil {
		return
	}
	_, err = stmt.Exec(post.Title, post.Content, post.ID)
	return
}

func DeletePost(postID int) (err error) {
	_, err = DB.Exec(`DELETE FROM posts WHERE id = ?`, postID)
	return
}

func GetLikedPosts(username string) (posts []Post, err error) {
	posts = []Post{}

	query := `SELECT p.post_id, p.title, p.author, p.content, p.created_at, 
                     (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id AND isLike = 1) AS likes,
                     (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id AND isLike = 0) AS dislikes,
                     (SELECT isLike FROM likes WHERE post_id = p.post_id AND username = ?) AS UserLikeStatus
              FROM posts p
              JOIN likes l ON p.post_id = l.post_id
              WHERE l.username = ? AND l.isLike = 1`

	rows, err := DB.Query(query, username, username)
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var post Post
		var userLikeStatus sql.NullBool
		err := rows.Scan(&post.ID, &post.Title, &post.Author, &post.Content, &post.Created_At, &post.Likes, &post.DisLikes, &userLikeStatus)
		if err != nil {
			return nil, err
		}
		if userLikeStatus.Valid {
			post.UserLikeStatus = boolToInt(userLikeStatus.Bool)
		} else {
			post.UserLikeStatus = 0 //for null
		}
		posts = append(posts, post)
	}

	// fmt.Println("liked posts")
	// fmt.Println(posts)
	return
}

func GetPostsByCategories(categories []string, username string) ([]Post, error) {
	var posts []Post

	// Create placeholders for the SQL IN clause
	placeholders := strings.Repeat("?,", len(categories)-1) + "?"

	// Query to fetch posts filtered by categories
	query := `
		SELECT p.post_id, p.title, p.author, p.content, p.created_at, 
		       (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id AND isLike = 1) AS likes,
		       (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id AND isLike = 0) AS dislikes
		FROM posts p
		JOIN post_category pc ON p.post_id = pc.post_id
		JOIN categories c ON pc.cat_id = c.cat_id
		WHERE c.name IN (` + placeholders + `)
		GROUP BY p.post_id, p.title, p.author, p.content, p.created_at
		ORDER BY p.created_at DESC`

	// Prepare arguments for the query
	args := make([]interface{}, len(categories))
	for i, category := range categories {
		args[i] = category
	}

	// Execute the query
	rows, err := DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Iterate through the results and populate the posts slice
	for rows.Next() {
		var post Post
		var createdAt time.Time

		err := rows.Scan(&post.ID, &post.Title, &post.Author, &post.Content, &createdAt, &post.Likes, &post.DisLikes)
		if err != nil {
			return nil, err
		}
		formattedTime := createdAt.In(time.FixedZone("GMT+3", 3*60*60)).Format("02/01/2006 03:04 PM")

		// Convert formattedTime back to time.Time using time.Parse
		post.Created_At, err = time.Parse("02/01/2006 03:04 PM", formattedTime)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

// because sqllite stores tinyInt
func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

func (p *Post) GetCategoryOfPost() (Categories []string, err error) {
	rows, err := DB.Query(`SELECT name FROM categories c
		INNER JOIN post_category pc ON c.cat_id = pc.cat_id
		WHERE pc.post_id = ?`, p.ID)
	if err != nil {
		return
	}
	defer rows.Close()

	var categories []string
	for rows.Next() {
		var category string
		if err := rows.Scan(&category); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return categories, nil
}
