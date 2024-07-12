package main

import (
	controller "forum/controller"
	model "forum/model"
	"log"
	"net/http"
)

func main() {
	server := http.Server{
		Addr:    "0.0.0.0:8080",
		Handler: controller.MuxSetup(),
	}

	log.Println("Server running on :8080")
	log.Fatal("main.main", server.ListenAndServe())

	defer model.DB.Close()
}
