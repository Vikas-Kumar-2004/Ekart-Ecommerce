package dashboard

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// @Summary      Get sales dashboard data
// @Tags         Dashboard
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  SalesDataResponse
// @Router       /dashboard/sales [get]
func (h *Handler) GetSalesData(c *gin.Context) {
	data, err := h.svc.GetSalesData(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"totalUsers":    data.TotalUsers,
		"totalProducts": data.TotalProducts,
		"totalOrders":   data.TotalOrders,
		"totalSales":    data.TotalSales,
		"sales":         data.Sales,
	})
}
