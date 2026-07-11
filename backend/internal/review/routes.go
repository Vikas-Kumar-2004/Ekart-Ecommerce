package review

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.RouterGroup, h *Handler, authMiddleware gin.HandlerFunc) {
	reviewGroup := r.Group("/review")
	{
		// Public route to get reviews for a product
		reviewGroup.GET("/product/:productId", h.GetReviewsByProduct)

		// Protected routes
		protected := reviewGroup.Group("/", authMiddleware)
		{
			protected.POST("/add", h.AddReview)
			protected.PUT("/:id", h.UpdateReview)
			protected.DELETE("/:id", h.DeleteReview)
		}
	}
}
