package product

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, p *Product) error
	SaveImages(ctx context.Context, images []ProductImage) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetImages(ctx context.Context, productID uuid.UUID) ([]ProductImage, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Product, error)
	GetAll(ctx context.Context, filter ProductFilter, page, limit int) ([]*Product, int, error)
	DeleteImages(ctx context.Context, productID uuid.UUID, publicIDs []string) error
	UpdateProduct(ctx context.Context, p *Product) error
	GetUniqueCategories(ctx context.Context) ([]string, error)
	GetUniqueBrands(ctx context.Context) ([]string, error)
}

type Service interface {
	AddProduct(ctx context.Context, userID uuid.UUID, req *AddProductRequest, files [][]byte) (*ProductResponse, error)
	GetAllProducts(ctx context.Context, filter ProductFilter, page, limit int) (*PaginatedProductResponse, error)
	DeleteProduct(ctx context.Context, productID uuid.UUID) error
	UpdateProduct(ctx context.Context, productID uuid.UUID, req *UpdateProductRequest, files [][]byte) (*ProductResponse, error)
	GetCategories(ctx context.Context) ([]string, error)
	GetBrands(ctx context.Context) ([]string, error)
}
