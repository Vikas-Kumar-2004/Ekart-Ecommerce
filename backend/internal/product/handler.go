package product

import (
	"io"
	"net/http"
	"strconv"

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
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "12") // 12 items default

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 12
	}

	minPrice, _ := strconv.ParseFloat(c.Query("minPrice"), 64)
	maxPrice, _ := strconv.ParseFloat(c.Query("maxPrice"), 64)

	filter := ProductFilter{
		Search:    c.Query("search"),
		Category:  c.Query("category"),
		Brand:     c.Query("brand"),
		MinPrice:  minPrice,
		MaxPrice:  maxPrice,
		SortOrder: c.Query("sortOrder"),
	}

	paginatedRes, err := h.svc.GetAllProducts(c.Request.Context(), filter, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	if len(paginatedRes.Products) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success":  true,
			"message":  "No Product available",
			"products": []any{},
			"pagination": gin.H{
				"totalItems":  paginatedRes.TotalItems,
				"totalPages":  paginatedRes.TotalPages,
				"currentPage": paginatedRes.CurrentPage,
				"limit":       paginatedRes.Limit,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"products": paginatedRes.Products,
		"pagination": gin.H{
			"totalItems":  paginatedRes.TotalItems,
			"totalPages":  paginatedRes.TotalPages,
			"currentPage": paginatedRes.CurrentPage,
			"limit":       paginatedRes.Limit,
		},
	})
}

// @Summary      Get all categories
// @Tags         Product
// @Produce      json
// @Success      200  {array}  string
// @Router       /product/categories [get]
func (h *Handler) GetCategories(c *gin.Context) {
	categories, err := h.svc.GetCategories(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "categories": categories})
}

// @Summary      Get all brands
// @Tags         Product
// @Produce      json
// @Success      200  {array}  string
// @Router       /product/brands [get]
func (h *Handler) GetBrands(c *gin.Context) {
	brands, err := h.svc.GetBrands(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "brands": brands})
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
