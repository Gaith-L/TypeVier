package handlers

import (
	"fmt"
	"net/http"
	"time"
)

var Routes = make(map[string]func(http.ResponseWriter, *http.Request))

func RootHandler(w http.ResponseWriter, r *http.Request) {
	fs := http.FileServer(http.Dir("frontend/public"))

	fmt.Println("Hit / " + time.Now().Format("15:04:05"))
	fs.ServeHTTP(w, r)
}

func TimeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Hit /time")
	fmt.Fprint(w, time.Now())
}

func TestHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Hit /test " + time.Now().Format("15:04:05"))
	http.ServeFile(w, r, "frontend/public/test.html")
}

func RegisterAndTrackHandler(pattern string, handler func(http.ResponseWriter, *http.Request)) {
	Routes[pattern] = handler
	http.HandleFunc(pattern, handler)
}
