package controller

import (
	"net/http"

)

func MuxSetup() (mux *http.ServeMux) {
	mux = http.NewServeMux()

	mux.Handle("/js/", http.StripPrefix("/js", http.FileServer(http.Dir("view/assets/js"))))
	mux.Handle("/css/", http.StripPrefix("/css", http.FileServer(http.Dir("view/assets/css"))))

	mux.HandleFunc("/", Index2)
	mux.HandleFunc("GET /signup/", redirecting)
	mux.HandleFunc("POST /signup/process", signupProcess)
	mux.HandleFunc("GET /login/", redirecting)
	mux.HandleFunc("POST /login/process", loginProcess)
	// mux.HandleFunc("GET /admin", admin)
	// mux.HandleFunc("GET /admin/process", adminProcess)
	mux.HandleFunc("GET /user/{username}", userProfile)

	mux.HandleFunc("GET /addpost", redirecting)
	mux.HandleFunc("POST /addpost", addPostProcess)
	mux.HandleFunc("GET /posts/{postID}", redirecting)
	mux.HandleFunc("GET /api/posts/{postID}", showPost2)
	mux.HandleFunc("POST /addcomment", addCommentProcess)
	mux.HandleFunc("GET /logout", logout)
	mux.HandleFunc("GET /likepost", likePost)
	mux.HandleFunc("GET /likecomment", likeComment)
	mux.HandleFunc("GET /mylikes", myLikes)

	mux.HandleFunc("/myposts", getMyPosts)
	// mux.HandleFunc("/updatepost", updatePost)
	// mux.HandleFunc("/deletepost", deletePost)

	mux.HandleFunc("GET /filterposts", filterPosts)

	
	mux.HandleFunc("/api/posts", FetchPosts)
	mux.HandleFunc("/api/session", FetchSession)
	mux.HandleFunc("GET /addPostPageapi",addPostPageapi)

	mux.HandleFunc("/chats",redirecting )
	mux.HandleFunc("/api/onlineusers", getOnlineUsers)
	mux.HandleFunc("GET /userchat/",redirecting)
	mux.HandleFunc("/api/userchat/", chatUser)
	mux.HandleFunc("/ws", handleConnections)
	mux.HandleFunc("/users", redirecting)
	mux.HandleFunc("/api/allusers",getAllUsers)
	mux.HandleFunc("/addPostProcess", addPostProcess)
	return
}
