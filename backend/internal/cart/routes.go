package cart

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.RouterGroup, h *Handler, authMiddleware gin.HandlerFunc) {
	cartGroup := r.Group("/cart")
	{
		cartGroup.GET("/get", authMiddleware, h.GetCart)
		cartGroup.POST("/add", authMiddleware, h.AddToCart)
		cartGroup.PUT("/update", authMiddleware, h.UpdateQuantity)
		cartGroup.DELETE("/remove", authMiddleware, h.RemoveFromCart)
	}
}
