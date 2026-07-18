package configs

import (
	"context"
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
	dsn := os.Getenv("DATABASE_URL")
	log.Println("DSN length:", len(dsn)) // temporary debug line
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

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
