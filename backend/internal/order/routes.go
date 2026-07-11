package order

import (
	"go-ekart/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.RouterGroup, h *Handler, authMiddleware gin.HandlerFunc) {
	orderGroup := r.Group("/orders")
	{
		orderGroup.POST("/create-order", authMiddleware, h.CreateOrder)
		orderGroup.POST("/verify-payment", authMiddleware, h.VerifyPayment)
	}
	orderGroup.GET("/user-order/:userId", authMiddleware, h.GetUserOrders)
	orderGroup.GET("/myorder", authMiddleware, h.GetMyOrders)
	// admin only
	admin := orderGroup.Group("/", authMiddleware, middleware.IsAdmin)
	{
		admin.GET("/all", h.GetAllOrders)
		admin.PUT("/status/:id", h.UpdateOrderStatus)
	}
}
