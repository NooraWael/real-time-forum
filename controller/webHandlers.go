package controller

import (
	"fmt"
	"forum/model"
	"net/http"
)

func index(w http.ResponseWriter, r *http.Request) {
    data.Message = ""
    if r.URL.Path != "/" {
        errorHandler(w, http.StatusNotFound)
        return
    }

    c, err := r.Cookie("user_session")
    var session model.Session
    isLoggedIn := false
    if err == nil {
        session, err = model.GetSession(c.Value)
        if err == nil && session.UserName != "" {
            isLoggedIn = true
        }
    }

    var posts []model.Post
    if len(r.URL.Query()["categories"]) > 0 {
        posts, err = model.GetPostsByCategories(r.URL.Query()["categories"], session.UserName)
        if err != nil {
            errorHandler(w, http.StatusInternalServerError)
            return
        }
    } else {
        posts, err = model.GetPosts(session.UserName)
        if err != nil {
            errorHandler(w, http.StatusInternalServerError)
            return
        }
    }

    for index := range posts {
        posts[index].Categories, err = posts[index].GetCategoryOfPost()
        if err != nil {
            errorHandler(w, http.StatusInternalServerError)
            return
        }
    }

    categories, err := model.GetAllCategories()
    if err != nil {
        fmt.Println(err)
        errorHandler(w, http.StatusInternalServerError)
        return
    }

    successMessage := r.URL.Query().Get("success")
    data := struct {
        Session        model.Session
        Posts2         []model.Post
        Categories     []string
        SuccessMessage string
		LoggedIn       bool
    }{
        Session:        session,
        Posts2:         posts,
        Categories:     categories,
        SuccessMessage: successMessage,
		LoggedIn: isLoggedIn,
    }

    if isLoggedIn {
        renderHTML(w, data, "layout", "navbar-user", "posts", "footer")
    } else {
        renderHTML(w, data, "layout", "navbar-guest", "posts", "footer")
    }
}

func errorHandler(w http.ResponseWriter, status int) {
	w.WriteHeader(status)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	switch status {
	case http.StatusBadRequest:
		tmpl.ExecuteTemplate(w, "400.html", nil)
	case http.StatusMethodNotAllowed:
		tmpl.ExecuteTemplate(w, "400.html", nil)
	case http.StatusUnauthorized:
		tmpl.ExecuteTemplate(w, "401.html", nil)
	case http.StatusNotFound:
		tmpl.ExecuteTemplate(w, "404.html", nil)
	case http.StatusInternalServerError:
		tmpl.ExecuteTemplate(w, "500.html", nil)
	}
}


func Index2(w http.ResponseWriter, r *http.Request) {
	// Initialize data structure to hold template data
	data := struct {
		Session        model.Session
		Posts          []model.Post
		Categories     []string
		SuccessMessage string
		LoggedIn       bool
	}{
		Session: model.Session{}, // Initialize with an empty session
		Posts:   []model.Post{},  // Initialize with an empty slice of posts
	}

	// Check if user is logged in by retrieving session from cookie
	cookie, err := r.Cookie("user_session")
	if err == nil {
		data.Session, err = model.GetSession(cookie.Value)
		if err == nil && data.Session.UserName != "" {
			data.LoggedIn = true
		}
	}

	// Fetch posts based on query parameters (categories filter)
	if len(r.URL.Query()["categories"]) > 0 {
		data.Posts, err = model.GetPostsByCategories(r.URL.Query()["categories"], data.Session.UserName)
	} else {
		data.Posts, err = model.GetPosts(data.Session.UserName)
	}
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Fetch all categories for the sidebar
	data.Categories, err = model.GetAllCategories()
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Fetch success message from query parameter (if any)
	data.SuccessMessage = r.URL.Query().Get("success")

	// Render the HTML template with the fetched data
	if err := tmpl.ExecuteTemplate(w, "template.html", data); err != nil {
		fmt.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}