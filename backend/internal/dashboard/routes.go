package dashboard

import "github.com/gin-gonic/gin"

func RegisterRoutes(r *gin.RouterGroup, h *Handler, authMiddleware, adminMiddleware gin.HandlerFunc) {
	dashGroup := r.Group("/orders", authMiddleware, adminMiddleware)
	{
		dashGroup.GET("/sales", h.GetSalesData)
	}
}
