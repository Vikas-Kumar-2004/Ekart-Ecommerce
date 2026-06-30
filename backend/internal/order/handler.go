package order

import (
	"net/http"

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
	orders, err := h.svc.GetAllOrders(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch all orders",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(orders), // JS ka orders.length
		"orders":  orders,
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
