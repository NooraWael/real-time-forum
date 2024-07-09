package controller

import (
	"fmt"
	"html/template"
	"net/http"
)

func renderHTML(w http.ResponseWriter, data any, pages ...string) {
	var pageFiles []string
	for _, p := range pages {
		pageFiles = append(pageFiles, fmt.Sprintf("view/templates/%s.html", p))
	}

	templates, err := template.ParseFiles(pageFiles...)
	if err != nil {
		errorHandler(w, http.StatusInternalServerError)
		return

	}
	templates.ExecuteTemplate(w, "layout", data)
}
