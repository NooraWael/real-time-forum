package controller

import (
	"encoding/json"
	"forum/model"
	"net/http"
	"strconv"
	"strings"
)

func addCommentProcess(w http.ResponseWriter, r *http.Request) {
	// get post id
	cookie, err := r.Cookie("user_session")
	if err != nil {
		http.Redirect(w, r, "/login/", http.StatusSeeOther)
		return
	}

	var session model.Session
	session, err = model.GetSession(cookie.Value)
	if err != nil { // if session is not in database, means session timed out
		http.Redirect(w, r, "/login/", http.StatusSeeOther)
		return
	}

	// get content from form
	postid := strings.TrimSpace(r.PostFormValue("postID"))
	if postid == "" {
		errorHandler(w, http.StatusBadRequest)
		return
	}
	postID, err := strconv.Atoi(postid)
	if err != nil { // if session is not in database, means session timed out
		errorHandler(w, http.StatusInternalServerError)
		return
	}
	content := strings.TrimSpace(r.PostFormValue("content2"))
	if content == "" {
		errorHandler(w, http.StatusBadRequest)
		return
	}

	// create new comment
	comment := model.NewComment(postID, session.UserName, content)

	err = comment.Create()
	if err != nil { // if session is not in database, means session timed out
		errorHandler(w, http.StatusInternalServerError)
		return
	}


    // Return JSON response
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(comment)
}
