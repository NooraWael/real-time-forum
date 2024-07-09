package controller

import (
	"log"
	"text/template"
)

func init() {
	var errorz error
	tmpl, errorz = template.ParseGlob("view/templates/*.html")
	if errorz != nil {
		log.Fatal("Error starting server! Parsing html error:", errorz)
	}
}

type webCommuniation struct {
	Username   string
	Email      string
	Message    string
	Categories []string
}

var (
	tmpl *template.Template
	data webCommuniation
)
