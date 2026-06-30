package product

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	svc Service // apne package ka interface
}

// @Summary      Add product
// @Tags         Product
// @Security     BearerAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        name formData string true "Product name"
// @Param        description formData string true "Product description"
// @Param        price formData float64 true "Product price"
// @Param        stock formData int true "Product stock"
// @Param        files formData file true "Product images (multiple allowed)"
// @Success      200  {object}  map[string]any
// @Failure      400  {object}  map[string]any
// @Router       /products/add [post]
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) AddProduct(c *gin.Context) {
	// 1. logged in userID — auth middleware se
	userID, _ := uuid.Parse(c.GetString("uid"))

	// 2. form bind karo — JSON nahi, multipart hai
	var req AddProductRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request"})
		return
	}

	// 3. multiple files — JS ka req.files
	var fileBytes [][]byte
	form, err := c.MultipartForm()
	if err == nil {
		for _, file := range form.File["files"] { // 👈 Grabs the image files here
			f, _ := file.Open()
			defer f.Close()
			b, _ := io.ReadAll(f)
			fileBytes = append(fileBytes, b)
		}
	}
	// Passes the text data (req) AND the images (fileBytes) to the service
	product, err := h.svc.AddProduct(c.Request.Context(), userID, &req, fileBytes)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product added successfully",
		"product": product,
	})
}

// @Summary      Get all products
// @Tags         Product
// @Produce      json
// @Success      200  {array}  ProductResponse
// @Failure      500  {object}  map[string]any
// @Router       /products [get]
func (h *Handler) GetAllProducts(c *gin.Context) {
	products, err := h.svc.GetAllProducts(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// JS ka if (!products) — empty slice pe 404
	if len(products) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success":  false,
			"message":  "No Product available",
			"products": []any{},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"products": products,
	})
}

// @Summary      Delete product
// @Tags         Product
// @Security     BearerAuth
// @Param        productId path string true "Product ID"
// @Success      200  {object}  map[string]any
// @Failure      404  {object}  map[string]any
// @Failure      500  {object}  map[string]any
// @Router       /products/{productId} [delete]
func (h *Handler) DeleteProduct(c *gin.Context) {
	productID, err := uuid.Parse(c.Param("productId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid product id"})
		return
	}

	if err := h.svc.DeleteProduct(c.Request.Context(), productID); err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "product not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product deleted successfully",
	})
}

// @Summary      Update product
// @Tags         Product
// @Security     BearerAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        productId path string true "Product ID"
// @Param        name formData string false "Product name"
// @Param        description formData string false "Product description"
// @Param        price formData float64 false "Product price"
// @Param        stock formData int false "Product stock"
// @Param        files formData file false "Product images (multiple allowed)"
// @Success      200  {object}  map[string]any
// @Failure      404  {object}  map[string]any
// @Router       /products/{productId} [put]
func (h *Handler) UpdateProduct(c *gin.Context) {
	productID, err := uuid.Parse(c.Param("productId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid product id"})
		return
	}

	var req UpdateProductRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request"})
		return
	}

	// multiple files — JS ka req.files
	var fileBytes [][]byte
	form, err := c.MultipartForm()
	if err == nil {
		for _, file := range form.File["files"] {
			f, _ := file.Open()
			defer f.Close()
			b, _ := io.ReadAll(f)
			fileBytes = append(fileBytes, b)
		}
	}

	product, err := h.svc.UpdateProduct(c.Request.Context(), productID, &req, fileBytes)
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
		"message": "Product updated successfully",
		"product": product,
	})
}
