package main

import (
	"log"

	"go-ekart/configs"
	"go-ekart/internal/bootstrap"
	"go-ekart/internal/utils"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "go-ekart/docs"
)

// @title           Ekart API
// @version         1.0
// @description     This is a sample server Ekart server.
// @host            localhost:8080
// @BasePath        /
func main() {
	// Initialize Database
	dbPool := configs.NewPostgresDB()
	defer dbPool.Close()

	// Initialize Cloudinary
	utils.InitCloudinary()
	utils.InitRazorpay()

	// ==========================================
	// Router Setup (Bootstrap)
	// ==========================================
	router := bootstrap.Init(dbPool)
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// ==========================================
	// Start Server
	// ==========================================
	port := ":8080"
	log.Printf("Starting server on port %s", port)
	if err := router.Run(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
