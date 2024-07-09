package model

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

func init() {
	var err error

	DB, err = sql.Open("sqlite3", "./model/forum.db")
	if err != nil {
		log.Fatal(err)

	}

	schema, err := os.ReadFile("./model/schema.sql")
	if err != nil {
		log.Fatal(err)
	}

	_, err = DB.Exec(string(schema))
	if err != nil {
		log.Fatal(err)
	}

	if err := DB.Ping(); err != nil {
		log.Fatal(err)
	}

	cats := []string{"News", "Sports", "Technology"}

	for _, cat := range cats {
		newCat, err := NewCategory(cat)
		if err != nil {
			log.Fatal(err)
		}

		newCat.Create()
	}

	log.Println("DB connection initialized")
}
