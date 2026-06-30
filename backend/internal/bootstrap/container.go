package bootstrap

import (
	"go-ekart/internal/cart"
	"go-ekart/internal/dashboard"
	"go-ekart/internal/order"
	"go-ekart/internal/product"
	"go-ekart/internal/user"
	"go-ekart/pkg/cloudinary"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/razorpay/razorpay-go"
)

type Handlers struct {
	User      *user.Handler
	Product   *product.Handler
	Cart      *cart.Handler
	Order     *order.Handler
	Dashboard *dashboard.Handler
}

func BuildHandlers(db *pgxpool.Pool) *Handlers {
	// 1. User Module
	userRepo := user.NewRepository(db)
	userService := user.NewService(userRepo)
	userH := user.NewHandler(userService)

	// 2. Cloudinary Client
	cloudName := os.Getenv("CLOUD_NAME")
	apiKey := os.Getenv("API_KEY")
	apiSecret := os.Getenv("API_SECRET")
	cdnClient, err := cloudinary.NewClient(cloudName, apiKey, apiSecret)
	if err != nil {
		log.Printf("Failed to initialize Cloudinary client: %v", err)
	}

	// 3. Product Module
	productRepo := product.NewRepository(db)
	productService := product.NewService(productRepo, cdnClient)
	productH := product.NewHandler(productService)

	// 4. Cart Module
	cartRepo := cart.NewRepository(db)
	cartService := cart.NewService(cartRepo, cdnClient, productRepo)
	cartH := cart.NewHandler(cartService)

	// 5. Order Module
	rp := razorpay.NewClient(os.Getenv("RAZORPAY_KEY_ID"), os.Getenv("RAZORPAY_SECRET"))
	orderRepo := order.NewRepository(db)
	orderSvc := order.NewService(orderRepo, cartRepo, rp, os.Getenv("RAZORPAY_SECRET"))
	orderH := order.NewHandler(orderSvc)

	// 6. Dashboard Module
	dashRepo := dashboard.NewRepository(db)
	dashSvc := dashboard.NewService(dashRepo)
	dashH := dashboard.NewHandler(dashSvc)

	return &Handlers{
		User:      userH,
		Product:   productH,
		Cart:      cartH,
		Order:     orderH,
		Dashboard: dashH,
	}
}
