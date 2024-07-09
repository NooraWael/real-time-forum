package controller

import (
	"fmt"
	"forum/model"
	"net/http"
)

func myLikes(w http.ResponseWriter, r *http.Request) {
	fmt.Println("ENTER: myLikes")
	c, err := r.Cookie("user_session")
	if err != nil {
		// If there's no session cookie, redirect to login page
		http.Redirect(w, r, "/login", http.StatusFound)
		return
	}

	session, err := model.GetSession(c.Value)
	if err != nil {
		// If the session is invalid, redirect to login page
		http.Redirect(w, r, "/login", http.StatusFound)
		return
	}

	// Fetch liked posts from the database
	likedPosts, err1 := model.GetLikedPosts(session.UserName)
	if err1 != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	data := struct {
		Session model.Session
		Posts2  []model.Post
	}{
		Session: session,
		Posts2:  likedPosts,
	}

	renderHTML(w, data, "layout", "navbar-user", "liked", "footer")
}
