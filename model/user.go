package model

import (
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	UserName   string
	Email      string
	FirstName string
	LastName string
	Gender string
	Age int
	Password   string
	Role       string
	Created_At time.Time
	status     string
}

func (u *User) Create() (err error) {
	stmt, err := DB.Prepare(`INSERT INTO users (username, email,firstName,lastName,gender,age, password)
    VALUES (?, ?, ?,?,?,?,?)`)
	if err != nil {
		return
	}

	_, err = stmt.Exec(u.UserName, u.Email,u.FirstName,u.LastName,u.Gender,u.Age, u.Password)
	if err != nil {
		return
	}

	return
}

func NewUser(userName, email, password,firstName,lastName,gender string, age int) (*User, error) {
	encPass, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return nil, err
	}

	return &User{
		UserName: userName,
		Email:    email,
		FirstName: firstName,
		LastName: lastName,
		Gender: gender,
		Age: age,
		Password: string(encPass),
	}, nil
}

func GetUser(username, password string) (user User, err error) {
	user = User{}
	stmt, err := DB.Prepare(`SELECT * FROM users WHERE username=? OR email=?`)
	if err != nil {
		return
	}

	err = stmt.QueryRow(username,username).Scan(&user.UserName, &user.Email,&user.FirstName,&user.LastName,&user.Gender,&user.Age, &user.Password,&user.status, &user.Role, &user.Created_At)
	if err != nil {
		return
	}

	// Cases where user is retrieved for mod purposes will have a call to GetUser without password
	// else, password will have to be validated
	if password != "" {
		err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
		if err != nil {
			return
		}
	}

	return
}

// adapt to User method
func (u *User) Update() (err error) {
	stmt, err := DB.Prepare(`UPDATE users SET username=? email=? password=? role=? WHERE username=?`)
	if err != nil {
		return
	}

	_, err = stmt.Exec(u.UserName, u.Email, u.Password, u.Role)
	if err != nil {
		return
	}

	return
}

func ChangeStatus(username string, status string){
	stmt, err := DB.Prepare(`UPDATE users SET status=? WHERE username=?`)
	if err != nil {
		return
	}

	_, err = stmt.Exec(status, username)
	if err != nil {
		return
	}

	return
}

func GetAllOnlineUsers() (allUsers[]string, err error) {
	stmt,err := DB.Prepare(`SELECT username FROM users where status="online" `)
	if err!= nil {
		return nil, err
	}
	defer stmt.Close()
	rows, err := stmt.Query()
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    for rows.Next() {
        var user string
        if err := rows.Scan(&user); err != nil {
            return nil, err
        }
        allUsers = append(allUsers, user)
    }

    if err := rows.Err(); err != nil {
        return nil, err
    }

    return allUsers, nil

} 

func GetAllUsers() ([]string, error) {
	stmt, err := DB.Prepare(`SELECT username FROM users`)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var usernames []string
	for rows.Next() {
		var username string
		err := rows.Scan(&username)
		if err != nil {
			return nil, err
		}
		usernames = append(usernames, username)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return usernames, nil
}
