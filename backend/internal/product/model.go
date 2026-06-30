package product

import (
	"time"

	"github.com/google/uuid"
)

type Product struct {
	ID           uuid.UUID
	UserID       uuid.UUID
	ProductName  string
	ProductDesc  string
	ProductPrice float64
	Category     string
	Brand        string
	CreatedAt    time.Time
	UpdatedAt    time.Time

	Images []ProductImage
}

type ProductImage struct {
	ID        uuid.UUID
	ProductID uuid.UUID
	URL       string
	PublicID  string
}
