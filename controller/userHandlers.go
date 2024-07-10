package controller

import (
	"encoding/json"
	"fmt"
	"forum/model"
	"net/http"
	"strings"
	"time"

	"github.com/gofrs/uuid"
)

func signup(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(w, "signup.html", nil)
}

func signupProcess(w http.ResponseWriter, r *http.Request) {
	user, err := model.NewUser(
		strings.TrimSpace(r.PostFormValue("user_name")),
		strings.TrimSpace(r.PostFormValue("email")),
		strings.TrimSpace(r.PostFormValue("password")))

	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	if user.UserName == "" || user.Password == "" || user.Email == "" {
		errorHandler(w, http.StatusBadRequest)
		return
	}

	err = user.Create()

	if err != nil { // if error is returned, means invalid login
		data.Username = r.PostFormValue("user_name")
		if err.Error() == "UNIQUE constraint failed: users.username" {
			data.Message = "User already exists... Try another one"

		} else if err.Error() == "UNIQUE constraint failed: users.email" {

			data.Message = "Email already exists... did you forget?"
		}
		tmpl.ExecuteTemplate(w, "signup.html", data)
		return
	}

	data.Message = "" // if signup is successful so clear the message just incase

	uuid, _ := uuid.NewV1()
	c := &http.Cookie{
		Name:     "user_session",
		Value:    uuid.String(),
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, c)

	session := model.NewSession(uuid.String(), user.UserName)
	err = session.Create()
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	model.ChangeStatus(user.UserName, "online")
	http.Redirect(w, r, "/", http.StatusSeeOther)

}

func login(w http.ResponseWriter, r *http.Request) {
	err := tmpl.ExecuteTemplate(w, "login.html", data)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}
}

func loginProcess(w http.ResponseWriter, r *http.Request) {
	username := strings.TrimSpace(r.PostFormValue("user_name"))
	if username == "" {
		errorHandler(w, http.StatusBadRequest)
		return
	}

	password := strings.TrimSpace(r.PostFormValue("password"))
	if password == "" {
		data.Message = "Please enter a password"
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	user, err := model.GetUser(
		username,
		password)

	if err != nil { // if error is returned, means invalid login
		data.Username = r.PostFormValue("user_name")
		if err.Error() == "sql: no rows in result set" {
			data.Message = "Invalid Login! User doesn't exist"

		} else if err.Error() == "crypto/bcrypt: hashedPassword is not the hash of the given password" {

			data.Message = "Invalid Login! Wrong password"
		}
		// data.Message = "Invalid Login!"
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	uuid, _ := uuid.NewV1()
	c := &http.Cookie{
		Name:     "user_session",
		Value:    uuid.String(),
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, c)
	data.Message = "" // if signup is successful so clear the message just incase

	session := model.NewSession(uuid.String(), user.UserName)
	err = session.Create()
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
	}

	model.ChangeStatus(user.UserName, "online")
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func admin(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(w, "admin.html", nil)
}

func adminProcess(w http.ResponseWriter, r *http.Request) {
	user, err := model.GetUser(r.PostFormValue("user_name"), "")
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	user.UserName = r.PostFormValue("user_name")
	user.Role = r.PostFormValue("role")
	err = user.Update()
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	tmpl.ExecuteTemplate(w, "adminproc.html", user)
}

func userProfile(w http.ResponseWriter, r *http.Request) {
	// Get the username from the URL path
	userName := r.URL.Path[len("/user/"):] // Assuming the path is "/user/{username}"

	// Retrieve the logged-in user's session
	sessionCookie, err := r.Cookie("user_session")
	if err != nil {
		errorHandler(w, http.StatusUnauthorized) // Handle unauthorized access if session cookie is missing
		return
	}

	session, err := model.GetSession(sessionCookie.Value)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	// Compare the logged-in user's username with the requested username
	if session.UserName != userName {
		errorHandler(w, http.StatusNotFound) // Return 404 if usernames do not match
		return
	}

	// Retrieve user details from the model
	user, err := model.GetUser(userName, "")
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return
	}

	tmpl.ExecuteTemplate(w, "profile.html", user)
}

/* This function does logout functionality by just clearing the available cookies. */
func logout(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("user_session")
    var session model.Session
    if err == nil {
        session,err = model.GetSession(c.Value)
		if err == nil {
			model.ChangeStatus(session.UserName, "offline")
		}
	}

	expiringCookie := http.Cookie{
		Name:    "user_session",
		Value:   "",
		Expires: time.Unix(0, 0),
		MaxAge:  -1,
	}

	http.SetCookie(w, &expiringCookie)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}



func chatUser(w http.ResponseWriter, r *http.Request) {
	recipientUsername := strings.TrimPrefix(r.URL.Path, "/api/userchat/")
	// Retrieve the logged-in user's session
	sessionCookie, err := r.Cookie("user_session")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	session, err := model.GetSession(sessionCookie.Value)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusInternalServerError)
		return
	}

	fmt.Println(recipientUsername)
	if (recipientUsername == ""){
		recipientUsername = session.UserName
	}

	


	onlineusers,err := model.GetAllOnlineUsers()
	if err != nil {
		http.Error(w, "Invalid session", http.StatusInternalServerError)
		return
	}

	var filteredOnlineUsers []string
for _, user := range onlineusers {
    if user != session.UserName {
        filteredOnlineUsers = append(filteredOnlineUsers, user)
    }
}


	recentchats, err := model.GetMessageHistoryUser(session.UserName,filteredOnlineUsers)
	if err != nil {
		fmt.Println("here")
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	
	data := struct {
		Username  string
		Recipient string
		Online []string
		Recentchat [][2]string
	}{
		Username:  session.UserName,
		Recipient: recipientUsername,
		Online : filteredOnlineUsers,
		Recentchat : recentchats,
	}

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}
