package review

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) AddReview(c *gin.Context) {
	// Extract user ID from auth middleware context
	uidStr := c.GetString("uid")
	if uidStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized"})
		return
	}
	
	userID, err := uuid.Parse(uidStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid user ID format"})
		return
	}

	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "error": err.Error()})
		return
	}

	_, err = h.service.AddReview(c.Request.Context(), userID, &req)
	if err != nil {
		if err.Error() == "ERROR: duplicate key value violates unique constraint \"unique_user_product_review\" (SQLSTATE 23505)" {
			c.JSON(http.StatusConflict, gin.H{"success": false, "message": "You have already reviewed this product"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to add review", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "Review added successfully"})
}

func (h *Handler) UpdateReview(c *gin.Context) {
	uidStr := c.GetString("uid")
	if uidStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized"})
		return
	}
	
	userID, err := uuid.Parse(uidStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid user ID format"})
		return
	}
	
	userRole := c.GetString("role")

	reviewIDStr := c.Param("id")
	reviewID, err := uuid.Parse(reviewIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid review ID", "error": err.Error()})
		return
	}

	var req UpdateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body", "error": err.Error()})
		return
	}

	_, err = h.service.UpdateReview(c.Request.Context(), userID, userRole, reviewID, &req)
	if err != nil {
		if err.Error() == "unauthorized: you can only update your own review" {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to update review", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Review updated successfully"})
}

func (h *Handler) DeleteReview(c *gin.Context) {
	uidStr := c.GetString("uid")
	if uidStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized"})
		return
	}
	
	userID, err := uuid.Parse(uidStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid user ID format"})
		return
	}
	
	userRole := c.GetString("role")

	reviewIDStr := c.Param("id")
	reviewID, err := uuid.Parse(reviewIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid review ID", "error": err.Error()})
		return
	}

	err = h.service.DeleteReview(c.Request.Context(), userID, userRole, reviewID)
	if err != nil {
		if err.Error() == "unauthorized: you can only delete your own review" {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to delete review", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Review deleted successfully"})
}

func (h *Handler) GetReviewsByProduct(c *gin.Context) {
	productIDStr := c.Param("productId")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid product ID", "error": err.Error()})
		return
	}

	reviews, err := h.service.GetReviewsByProduct(c.Request.Context(), productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch reviews", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Reviews fetched successfully", "reviews": reviews})
}
