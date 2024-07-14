package controller

import (
	"encoding/json"
	"fmt"
	model "forum/model"
	"html/template"
	"net/http"
	"strconv"
	"strings"
)

type PostData struct {
	Post     model.Post
	Comments []model.Comment
}

func addPostPage(w http.ResponseWriter, r *http.Request) {
	_, err := r.Cookie("user_session")
	if err != nil {
		errorHandler(w, http.StatusUnauthorized)
		return
	}
	data.Categories, err = model.GetAllCategories()
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}
	if err := template.Must(template.ParseFiles("view/templates/addpost.html")).Execute(w, data); err != nil {
		errorHandler(w, http.StatusInternalServerError)
	}
}

func addPostProcess(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("user_session")
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var session model.Session
	session, err = model.GetSession(cookie.Value)
	if err != nil {
		http.Error(w, `{"error": "Session timed out"}`, http.StatusUnauthorized)
		return
	}

	if err = r.ParseForm(); err != nil {
		http.Error(w, `{"error": "Invalid form data"}`, http.StatusBadRequest)
		return
	}

	categories := r.Form["category"]
	title := strings.TrimSpace(r.FormValue("title"))
	content := strings.TrimSpace(r.FormValue("content"))

	if title == "" || content == "" {
		http.Error(w, `{"error": "All fields are required"}`, http.StatusBadRequest)
		return
	}

	thisPost := model.NewPost(session.UserName, title, content)
	thisPost.Likes, thisPost.DisLikes = 0, 0
	thisPost.ID, err = thisPost.Create()
	if err != nil {
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}

	for _, cat := range categories {
		category, err := model.GetCategory(cat)
		if err != nil {
			http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
			return
		}
		err = model.AddPostCategory(*thisPost, *category)
		if err != nil {
			http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true, "message": "Post added successfully"}`))
}

func showPost(w http.ResponseWriter, r *http.Request) {
	data := PostData{}

	postID := r.PathValue("postID")
	id, err := strconv.Atoi(postID)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	data.Post, err = model.GetPost(id)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	data.Post.Categories, err = data.Post.GetCategoryOfPost()
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
	}

	data.Comments, err = model.GetPostComments(id)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	tmpl, err := template.ParseFiles("view/templates/post.html")
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
	}

	tmpl.Execute(w, data)
}

func getMyPosts(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("user_session")
	var session model.Session
	if err == nil {
		session, err = model.GetSession(c.Value)
	}

	if err != nil {
		errorHandler(w, http.StatusUnauthorized)
		return
	}

	posts, err := model.GetPostsByUser(session.UserName)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	// Calculate statistics
	totalPosts := len(posts)
	totalLikes := 0
	totalDislikes := 0

	for _, post := range posts {
		totalLikes += post.Likes
		totalDislikes += post.DisLikes
	}

	data := struct {
		Session       model.Session
		Posts         []model.Post
		TotalPosts    int
		TotalLikes    int
		TotalDislikes int
	}{
		Session:       session,
		Posts:         posts,
		TotalPosts:    totalPosts,
		TotalLikes:    totalLikes,
		TotalDislikes: totalDislikes,
	}

	renderHTML(w, data, "layout", "navbar-user", "myposts", "footer")
}

func updatePost(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("user_session")
	if err != nil {
		errorHandler(w, http.StatusUnauthorized)
		return
	}

	session, err := model.GetSession(c.Value)
	if err != nil {
		errorHandler(w, http.StatusUnauthorized)
		return
	}

	var requestBody struct {
		PostID  string `json:"postID"`
		Title   string `json:"title"`
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		fmt.Println("Error decoding request body:", err)
		errorHandler(w, http.StatusBadRequest)
		return
	}
	fmt.Println("Received request:", requestBody)

	fmt.Println(requestBody.PostID)
	// Convert PostID to int
	postID, err := strconv.Atoi(requestBody.PostID)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}
	fmt.Println("Parsed PostID:", postID)

	// Retrieve post from database
	post, err := model.GetPost(postID)
	if err != nil || post.Author != session.UserName {
		errorHandler(w, http.StatusUnauthorized)
		return
	}

	// Update post fields
	post.Title = requestBody.Title
	post.Content = requestBody.Content

	// Save updated post to database
	if err2 := model.UpdatePost(post); err2 != nil {
		fmt.Println(err2)
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	// Respond with success
	w.WriteHeader(http.StatusOK)
}

func deletePost(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("user_session")
	if err != nil {
		errorHandler(w, http.StatusUnauthorized)
		return
	}

	session, err := model.GetSession(c.Value)
	if err != nil {
		errorHandler(w, http.StatusUnauthorized)
		return
	}

	postID := r.URL.Query().Get("postID")
	postINT, err := strconv.Atoi(postID)
	if err != nil {
		errorHandler(w, http.StatusUnauthorized)
		return
	}
	post, err := model.GetPost(postINT)
	if err != nil || post.Author != session.UserName {
		errorHandler(w, http.StatusUnauthorized)
		return
	}

	err = model.DeletePost(post.ID)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, "/myposts?success=Post deleted successfully", http.StatusSeeOther)
}




func showPost2(w http.ResponseWriter, r *http.Request) {
	// Initialize PostData struct
	data := PostData{}

	// Extract post ID from URL path
	postID := r.URL.Path[len("/api/posts/"):] // Assuming "/api/post/{postID}"
	id, err := strconv.Atoi(postID)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	// Fetch post details from model
	data.Post, err = model.GetPost(id)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	// Fetch categories for the post
	data.Post.Categories, err = data.Post.GetCategoryOfPost()
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	// Fetch comments for the post
	data.Comments, err = model.GetPostComments(id)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	

	json.NewEncoder(w).Encode(data)

	
}
