package controller

import (
	"encoding/json"
	"forum/model"
	"net/http"
)

func FetchSession(w http.ResponseWriter, r *http.Request) {
	// Check if the request method is GET
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Fetch session cookie
	c, err := r.Cookie("user_session")
	if err != nil {
		http.Error(w, "Session cookie not found", http.StatusNotFound)
		return
	}

	// Retrieve session from the database using the session ID
	session, err := model.GetSession(c.Value)
	if err != nil {
		http.Error(w, "Session not found", http.StatusNotFound)
		return
	}

	// Convert session to JSON
	jsonSession, err := json.Marshal(session)
	if err != nil {
		http.Error(w, "Failed to marshal session to JSON", http.StatusInternalServerError)
		return
	}

	// Set content type to JSON
	w.Header().Set("Content-Type", "application/json")
	// Write JSON response
	w.Write(jsonSession)
}



// FetchPosts retrieves posts from the database based on user ID and categories
func FetchPosts(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")

    var posts []model.Post
    var err error

    c, err := r.Cookie("user_session")
    var session model.Session
    if err == nil {
        session, err = model.GetSession(c.Value)
    }

    if len(r.URL.Query()["categories"]) > 0 {
        posts, err = model.GetPostsByCategories(r.URL.Query()["categories"], session.UserName)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    } else {
        posts, err = model.GetPosts(session.UserName)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    }

    for index := range posts {
        posts[index].Categories, err = posts[index].GetCategoryOfPost()
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    }

    json.NewEncoder(w).Encode(posts)
}

func redirecting(w http.ResponseWriter, r *http.Request){
	Index2(w,r)
}

func addPostPageapi(w http.ResponseWriter, r *http.Request) {
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
    json.NewEncoder(w).Encode(data)
}

func getOnlineUsers(w http.ResponseWriter, r *http.Request) {
	data,err := model.GetAllOnlineUsers()
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(data)
}
