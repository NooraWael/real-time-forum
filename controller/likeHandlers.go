package controller

import (
	"encoding/json"
	"fmt"
	model "forum/model"
	"net/http"
	"strconv"
)

type LikeResponse struct {
	Success         bool `json:"success"`
	NewLikeCount    int  `json:"newLikeCount"`
	NewDislikeCount int  `json:"newDislikeCount"`
}

func likePost(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("user_session")
	if err != nil {
		http.Redirect(w, r, "/login/", http.StatusSeeOther)
		return
	}

	session, err := model.GetSession(c.Value)
	if err != nil {
		http.Redirect(w, r, "/login/", http.StatusSeeOther)
		return
	}

	id := r.URL.Query().Get("postID")
	liketype := r.URL.Query().Get("type")
	fmt.Printf("Received like request for postID: %s, type: %s\n", id, liketype)

	var option bool
	if liketype == "like" {
		option = true
	} else {
		option = false
	}

	post_id, err := strconv.Atoi(id)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	like, err := model.GetLike(post_id, session.UserName)
	if err != nil {
		fmt.Println("No existing like found, adding new like")
		model.AddPostLike(post_id, session.UserName, liketype)
	} else {
		if like.Type == option {
			fmt.Println("Existing like found, removing like")
			model.RemoveLike(like.ID)
		} else {
			fmt.Println("Existing like found, toggling like")
			like.Toggle()
		}
	}

	// Fetch the updated post to get the new like and dislike counts
	updatedPost, err := model.GetPost(post_id)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	response := LikeResponse{
		Success:         true,
		NewLikeCount:    updatedPost.Likes,
		NewDislikeCount: updatedPost.DisLikes,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	fmt.Println("Response sent:", response)
}

func likeComment(w http.ResponseWriter, r *http.Request) {
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
	commentID := r.URL.Query().Get("commentID")
	likeType := r.URL.Query().Get("type")
	fmt.Printf("Received like request for postID: %s, commentID: %s, type: %s\n", postID, commentID, likeType)

	var option bool
	if likeType == "like" {
		option = true
	} else {
		option = false
	}

	postIDInt, err := strconv.Atoi(postID)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	commentIDInt, err := strconv.Atoi(commentID)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	like, err := model.GetLikeComment(postIDInt, commentIDInt, session.UserName)
	if err != nil {
		fmt.Println("No existing like found, adding new like")
		model.AddCommentLike(postIDInt, commentIDInt, session.UserName, likeType)
	} else {
		if like.Type == option {
			fmt.Println("Existing like found, removing like")
			model.RemoveLike(like.ID)
		} else {
			fmt.Println("Existing like found, toggling like")
			like.Toggle()
		}
	}

	updatedComment, err := model.GetComment(commentIDInt)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	response := LikeResponse{
		Success:         true,
		NewLikeCount:    updatedComment.Likes,
		NewDislikeCount: updatedComment.DisLikes,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	fmt.Println("Response sent:", response)
}
