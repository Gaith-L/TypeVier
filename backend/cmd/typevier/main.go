package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Gaith-L/TypeVier/backend/internal/handlers"
	"github.com/savioxavier/termlink"
)

func main() {
	fmt.Println("------------- Application start -------------")

	const hostName string = "localhost:8080"

	handlers.RegisterAndTrackHandler("/", handlers.RootHandler)
	handlers.RegisterAndTrackHandler("/time", handlers.TimeHandler)
	handlers.RegisterAndTrackHandler("/test", handlers.TestHandler)

	fmt.Println("\n" + termlink.Link("http://"+hostName, "http://"+hostName))

	for pattern := range handlers.Routes {
		fmt.Println("route: " + termlink.Link("http://"+hostName+pattern, "http://"+hostName+pattern))
	}

	log.Fatal(http.ListenAndServe(hostName, nil))
}
