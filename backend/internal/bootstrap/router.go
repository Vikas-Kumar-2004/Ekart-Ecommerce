package bootstrap

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"go-ekart/internal/cart"
	"go-ekart/internal/dashboard"
	"go-ekart/internal/middleware"
	"go-ekart/internal/order"
	"go-ekart/internal/product"
	"go-ekart/internal/review"
	"go-ekart/internal/user"
)

func New(db *pgxpool.Pool, h *Handlers) *gin.Engine {
	r := gin.Default()

	// Enable CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Basic health check route
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "OK",
		})
	})

	apiV1 := r.Group("/api/v1")

	user.RegisterRoutes(
		apiV1,
		h.User,
		middleware.Authentication(),
		middleware.IsAdmin,
	)

	product.RegisterRoutes(
		apiV1,
		h.Product,
		middleware.Authentication(),
	)

	cart.RegisterRoutes(
		apiV1,
		h.Cart,
		middleware.Authentication(),
	)

	order.RegisterRoutes(
		apiV1,
		h.Order,
		middleware.Authentication(),
	)

	review.RegisterRoutes(
		apiV1,
		h.Review,
		middleware.Authentication(),
	)

	dashboard.RegisterRoutes(
		apiV1,
		h.Dashboard,
		middleware.Authentication(),
		middleware.IsAdmin,
	)

	r.GET("/api/v1/panic", func(c *gin.Context) {
		panic("test panic")
	})

	return r
}
