package model

type Session struct {
	UUID     string
	UserName string
	Token    int
}

/* This function creates the session struct and populates it with UUID & Username. */
func NewSession(uuid, username string) *Session {
	return &Session{
		UUID:     uuid,
		UserName: username,
	}
}

/* This method adds the session instance to the database and removes all other sessions for the user. It returns an error in case of any database error. */
func (s *Session) Create() (err error) {
	_, err = DB.Exec(`DELETE FROM sessions WHERE username = ?`, s.UserName)
	if err != nil {
		return
	}

	stmt, err := DB.Prepare(`INSERT INTO sessions (uuid, username)
    VALUES (?, ?)`)
	if err != nil {
		return
	}

	_, err = stmt.Exec(s.UUID, s.UserName)
	if err != nil {
		return
	}

	return
}

/*
	 This function gets the session details from database using UUID and return it. If no session or database error is found, then error is returned.
		If error is returned, it could also mean that user logged in other device.
*/
func GetSession(uuid string) (session Session, err error) {
	session = Session{}
	stmt, err := DB.Prepare(`SELECT * FROM sessions WHERE uuid=?`)
	if err != nil {
		return
	}

	err = stmt.QueryRow(uuid).Scan(&session.UUID, &session.UserName)
	if err != nil {
		return
	}

	return
}
