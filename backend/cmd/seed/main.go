package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"go-ekart/configs"
	"go-ekart/internal/utils"

	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

type DummyJSONResponse struct {
	Products []DummyProduct `json:"products"`
}

type DummyProduct struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Price       float64  `json:"price"`
	Category    string   `json:"category"`
	Brand       string   `json:"brand"`
	Images      []string `json:"images"`
}

func main() {
	// 1. Load env and initialize connections
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found, using system env variables")
	}

	dbPool := configs.NewPostgresDB()
	defer dbPool.Close()

	utils.InitCloudinary()
	ctx := context.Background()

	// 2. Get an admin user ID to assign these products to
	var adminID uuid.UUID
	err := dbPool.QueryRow(ctx, "SELECT id FROM users LIMIT 1").Scan(&adminID)
	if err != nil {
		log.Fatalf("No users found in database to assign products to. Please register a user first. Err: %v", err)
	}
	log.Printf("Assigning new products to UserID: %s", adminID)

	// 3. Fetch Mock Data from DummyJSON categories
	categories := []string{"smartphones", "laptops", "tablets", "mobile-accessories"}
	
	for _, category := range categories {
		log.Printf("Fetching products for category: %s...", category)
		url := fmt.Sprintf("https://dummyjson.com/products/category/%s", category)
		resp, err := http.Get(url)
		if err != nil {
			log.Printf("Failed to fetch category %s: %v", category, err)
			continue
		}
		
		var data DummyJSONResponse
		if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
			log.Printf("Failed to parse category %s: %v", category, err)
			resp.Body.Close()
			continue
		}
		resp.Body.Close()

		log.Printf("Fetched %d products from %s. Starting upload and DB insertion...", len(data.Products), category)

		// 4. Iterate and Seed
		for i, p := range data.Products {
			productID := uuid.New()
			log.Printf("[%s: %d/%d] Seeding Product: %s", category, i+1, len(data.Products), p.Title)

			// Create Product in DB
			queryProduct := `
				INSERT INTO products (id, user_id, product_name, product_desc, product_price, category, brand, created_at, updated_at) 
				VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
			`
			brand := p.Brand
			if brand == "" {
				brand = "Generic"
			}
			
			// Adjusting price for INR
			inrPrice := p.Price * 80 

			_, err := dbPool.Exec(ctx, queryProduct, productID, adminID, p.Title, p.Description, inrPrice, p.Category, brand)
			if err != nil {
				log.Printf("❌ Failed to insert product %s: %v", p.Title, err)
				continue
			}

			// Upload Images to Cloudinary directly from URL
			for imgIdx, imgURL := range p.Images {
				if imgIdx > 2 { // limit to max 3 images per product
					break
				}
				uploadResp, err := utils.Cloudinary.Upload.Upload(ctx, imgURL, uploader.UploadParams{
					Folder: "ekart_products",
				})
				if err != nil {
					log.Printf("  ⚠️ Failed to upload image for %s: %v", p.Title, err)
					continue
				}

				// Insert Image in DB
				queryImage := `
					INSERT INTO product_images (id, product_id, url, public_id) 
					VALUES ($1, $2, $3, $4)
				`
				_, err = dbPool.Exec(ctx, queryImage, uuid.New(), productID, uploadResp.SecureURL, uploadResp.PublicID)
				if err != nil {
					log.Printf("  ❌ Failed to insert image in DB for %s: %v", p.Title, err)
				} else {
					fmt.Print(".") // success tick
				}
			}
			fmt.Println(" ✅ Done")
		}
	}

	log.Println("\n🎉 Successfully seeded products!")
}
