package product

import (
	"go-ekart/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.RouterGroup, h *Handler, authMiddleware gin.HandlerFunc) {
	productGroup := r.Group("/product")
	{
		productGroup.POST("/add", authMiddleware, middleware.IsAdmin, h.AddProduct)
		productGroup.GET("/getallproducts", h.GetAllProducts)
		productGroup.GET("/categories", h.GetCategories)
		productGroup.GET("/brands", h.GetBrands)
		productGroup.DELETE("/delete/:productId", authMiddleware, middleware.IsAdmin, h.DeleteProduct)
		productGroup.PUT("/update/:productId", authMiddleware, middleware.IsAdmin, h.UpdateProduct)
	}
}
