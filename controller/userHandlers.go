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

type SignupRequest struct {
	UserName string `json:"user_name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func signup(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(w, "signup.html", nil)
}
func signupProcess(w http.ResponseWriter, r *http.Request) {
	// Decode JSON request body
	var req SignupRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	// Trim whitespace
	req.UserName = strings.TrimSpace(req.UserName)
	req.Email = strings.TrimSpace(req.Email)
	req.Password = strings.TrimSpace(req.Password)

	// Validate required fields
	if req.UserName == "" || req.Email == "" || req.Password == "" {
		http.Error(w, `{"error": "All fields are required"}`, http.StatusBadRequest)
		return
	}

	// Create new user
	user, err := model.NewUser(req.UserName, req.Email, req.Password)
	if err != nil {
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}

	// Attempt to create the user
	err = user.Create()
	if err != nil {
		var errorMessage string
		switch {
		case strings.Contains(err.Error(), "UNIQUE constraint failed: users.username"):
			errorMessage = "Username already exists. Try another one."
		case strings.Contains(err.Error(), "UNIQUE constraint failed: users.email"):
			errorMessage = "Email already exists. Did you forget?"
		default:
			errorMessage = "Internal server error"
		}
		http.Error(w, fmt.Sprintf(`{"error": "%s"}`, errorMessage), http.StatusInternalServerError)
		return
	}

	// Generate session UUID
	uuid, _ := uuid.NewV1()
	c := &http.Cookie{
		Name:     "user_session",
		Value:    uuid.String(),
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, c)

	// Create new session
	session := model.NewSession(uuid.String(), user.UserName)
	err = session.Create()
	if err != nil {
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}

	// Change user status to online
	model.ChangeStatus(user.UserName, "online")

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Signup successful"}`))
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
