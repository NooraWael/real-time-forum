package controller

import (
	"forum/model"
	"net/http"
	"strings"
)

func filterPosts(w http.ResponseWriter, r *http.Request) {
	data.Message = ""
	c, err := r.Cookie("user_session")
	var session model.Session
	if err == nil {
		session, _ = model.GetSession(c.Value)
	}
	categoriesParam := r.URL.Query().Get("categories")

	categories := strings.Split(categoriesParam, ",")

	if len(categories) == 1 && categories[0] == "" {
		posts, err := model.GetPosts(session.UserName)
		if err != nil {
			errorHandler(w, http.StatusInternalServerError)
			return
		}

		for i := range posts {
			posts[i].Categories, err = posts[i].GetCategoryOfPost()
			if err != nil {
				errorHandler(w, http.StatusInternalServerError)
				return
			}
		}

		// response := struct {
		// 	Posts []model.Post `json:"posts"`
		// }{
		// 	Posts: posts,
		// }

		// w.Header().Set("Content-Type", "application/json")
		// json.NewEncoder(w).Encode(response)

		renderHTML(w, posts, "layout")
	} else {
		posts, err := model.GetPostsByCategories(categories,session.UserName)
		if err != nil {
			errorHandler(w, http.StatusInternalServerError)
			return
		}

		for i := range posts {
			posts[i].Categories, err = posts[i].GetCategoryOfPost()
			if err != nil {
				errorHandler(w, http.StatusInternalServerError)
				return
			}
		}

		// response := struct {
		// 	Posts []model.Post `json:"posts"`
		// }{
		// 	Posts: posts,
		// }

		renderHTML(w, posts, "layout")

		// w.Header().Set("Content-Type", "application/json")
		// json.NewEncoder(w).Encode(response)
	}

}
