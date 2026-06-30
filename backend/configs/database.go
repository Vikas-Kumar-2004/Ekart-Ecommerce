package configs

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func NewPostgresDB() *pgxpool.Pool {
	// Load .env
	if err := godotenv.Load(); err != nil {
		if err := godotenv.Load("../../.env"); err != nil {
			log.Println("No .env file found; falling back to system environment variables.")
		}
	}

	// Connection string
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_SSLMODE"),
	)

	// Create connection pool
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatal("Unable to create connection pool:", err)
	}

	// Verify connection
	err = pool.Ping(context.Background())
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}

	log.Println("Connected to PostgreSQL successfully!")

	return pool
}
