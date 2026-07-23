package order

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// @Summary      Create order
// @Tags         Order
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body CreateOrderRequest true "Order payload"
// @Success      200  {object}  map[string]any
// @Router       /orders [post]
func (h *Handler) CreateOrder(c *gin.Context) {
	userID, _ := uuid.Parse(c.GetString("uid"))

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request"})
		return
	}

	resp, err := h.svc.CreateOrder(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"order":   resp.RazorpayOrder,
		"dbOrder": resp.DBOrder,
	})
}

// @Summary      Verify payment
// @Tags         Order
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body VerifyPaymentRequest true "Payment verification payload"
// @Success      200  {object}  map[string]any
// @Failure      400  {object}  map[string]any
// @Router       /orders/verify [post]
func (h *Handler) VerifyPayment(c *gin.Context) {
	userID, _ := uuid.Parse(c.GetString("uid"))

	var req VerifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request"})
		return
	}

	order, err := h.svc.VerifyPayment(c.Request.Context(), userID, &req)
	if err != nil {
		status := http.StatusInternalServerError
		switch err.Error() {
		case "payment failed":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Payment failed", "order": order})
			return
		case "invalid signature":
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid signature"})
			return
		}
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment successful",
		"order":   order,
	})
}

// @Summary      Get all orders (Admin)
// @Tags         Order
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  map[string]any
// @Router       /orders/admin [get]
func (h *Handler) GetAllOrders(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	orders, totalCount, err := h.svc.GetAllOrders(c.Request.Context(), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch all orders",
		})
		return
	}

	totalPages := (totalCount + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"orders":  orders,
		"pagination": gin.H{
			"currentPage": page,
			"totalPages":  totalPages,
			"totalOrders": totalCount,
		},
	})
}

// @Summary      Get orders by user ID
// @Tags         Order
// @Security     BearerAuth
// @Produce      json
// @Param        userId  path  string  true  "User ID"
// @Success      200  {object}  map[string]any
// @Router       /orders/user/{userId} [get]
func (h *Handler) GetUserOrders(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	orders, err := h.svc.GetUserOrders(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	}

	// JS ka empty check commented hai — hum bhi skip kar rahe, seedha return
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(orders),
		"orders":  orders,
	})
}

// @Summary      Get my orders
// @Tags         Order
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  map[string]any
// @Router       /orders/my-orders [get]
func (h *Handler) GetMyOrders(c *gin.Context) {
	// JS ka req.id — auth middleware se aata hai
	userID, err := uuid.Parse(c.GetString("uid"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "unauthorized"})
		return
	}

	// ✅ same service method reuse — GetUserOrders mein already bana hai
	orders, err := h.svc.GetUserOrders(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(orders),
		"orders":  orders,
	})
}

// @Summary      Update order status
// @Tags         Order
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Order ID"
// @Param        request body UpdateOrderStatusRequest true "Order status payload"
// @Success      200  {object}  map[string]any
// @Router       /orders/status/{id} [put]
func (h *Handler) UpdateOrderStatus(c *gin.Context) {
	orderIDStr := c.Param("id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid order id"})
		return
	}

	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request body", "error": err.Error()})
		return
	}

	err = h.svc.UpdateOrderStatus(c.Request.Context(), orderID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Order status updated successfully"})
}
