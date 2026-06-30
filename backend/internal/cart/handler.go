package cart

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

// @Summary      Get cart
// @Tags         Cart
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  Cart
// @Failure      500  {object}  map[string]any
// @Router       /cart [get]
func (h *Handler) GetCart(c *gin.Context) {
	userID, _ := uuid.Parse(c.GetString("uid")) // auth middleware se

	cart, err := h.svc.GetCart(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"cart":    cart,
	})
}

// @Summary      Add to cart
// @Tags         Cart
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body AddToCartRequest true "Cart payload"
// @Success      200  {object}  Cart
// @Failure      400  {object}  map[string]any
// @Router       /cart [post]
func (h *Handler) AddToCart(c *gin.Context) {
	userID, _ := uuid.Parse(c.GetString("uid"))

	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request"})
		return
	}

	cart, err := h.svc.AddToCart(c.Request.Context(), userID, &req)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "product not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product added to cart successfully",
		"cart":    cart,
	})
}

// @Summary      Update quantity in cart
// @Tags         Cart
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body UpdateQuantityRequest true "Cart update payload"
// @Success      200  {object}  Cart
// @Failure      400  {object}  map[string]any
// @Router       /cart/update [post]
func (h *Handler) UpdateQuantity(c *gin.Context) {
	userID, _ := uuid.Parse(c.GetString("uid"))

	var req UpdateQuantityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request"})
		return
	}

	cart, err := h.svc.UpdateQuantity(c.Request.Context(), userID, &req)
	if err != nil {
		status := http.StatusInternalServerError
		switch err.Error() {
		case "cart not found", "item not found":
			status = http.StatusNotFound
		case "invalid type — use 'increase' or 'decrease'":
			status = http.StatusBadRequest
		}
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"cart":    cart,
	})
}

// @Summary      Remove from cart
// @Tags         Cart
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body RemoveFromCartRequest true "Cart removal payload"
// @Success      200  {object}  Cart
// @Failure      400  {object}  map[string]any
// @Router       /cart/remove [post]
func (h *Handler) RemoveFromCart(c *gin.Context) {
	userID, _ := uuid.Parse(c.GetString("uid"))

	var req RemoveFromCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request"})
		return
	}

	cart, err := h.svc.RemoveFromCart(c.Request.Context(), userID, &req)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "cart not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"cart":    cart,
	})
}
