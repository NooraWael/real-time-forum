package main

import (
	controller "forum/controller"
	model "forum/model"
	"log"
	"net/http"
)

func main() {
	server := http.Server{
		Addr:    "0.0.0.0:3000",
		Handler: controller.MuxSetup(),
	}

	log.Println("Server running on :3000")
	log.Fatal("main.main", server.ListenAndServe())

	defer model.DB.Close()
}
