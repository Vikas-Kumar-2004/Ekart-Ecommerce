package main

import (
	"log"

	"go-ekart/internal/database"
)

func main() {
	if err := database.Migrate(); err != nil {
		log.Fatal(err)
	}
}
