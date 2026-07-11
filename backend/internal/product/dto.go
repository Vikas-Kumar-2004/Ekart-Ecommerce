package product

import "github.com/google/uuid"

type AddProductRequest struct {
	ProductName  string  `form:"productName"` // form: tag — multipart ke saath
	ProductDesc  string  `form:"productDesc"`
	ProductPrice float64 `form:"productPrice"`
	Category     string  `form:"category"`
	Brand        string  `form:"brand"`
}

type UpdateProductRequest struct {
	ProductName    string  `form:"productName"`
	ProductDesc    string  `form:"productDesc"`
	ProductPrice   float64 `form:"productPrice"`
	Category       string  `form:"category"`
	Brand          string  `form:"brand"`
	ExistingImages string  `form:"existingImages"` // JS ka JSON.parse(existingImages) — string aayega
}

type ProductImageResponse struct {
	URL      string `json:"url"`
	PublicID string `json:"public_id"`
}

type ProductResponse struct {
	ID           uuid.UUID              `json:"id"`
	ProductName  string                 `json:"productName"`
	ProductDesc  string                 `json:"productDesc"`
	ProductPrice float64                `json:"productPrice"`
	Category     string                 `json:"category"`
	Brand        string                 `json:"brand"`
	Images       []ProductImageResponse `json:"productImg"`
}

type PaginatedProductResponse struct {
	Products    []*ProductResponse `json:"products"`
	TotalItems  int                `json:"totalItems"`
	TotalPages  int                `json:"totalPages"`
	CurrentPage int                `json:"currentPage"`
	Limit       int                `json:"limit"`
}

type ProductFilter struct {
	Search    string
	Category  string
	Brand     string
	MinPrice  float64
	MaxPrice  float64
	SortOrder string
}
