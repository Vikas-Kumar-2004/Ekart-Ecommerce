package cart

import (
	"github.com/google/uuid"
	"time"
)

type Cart struct {
	ID         uuid.UUID
	UserID     uuid.UUID
	TotalPrice float64
	CreatedAt  time.Time
	UpdatedAt  time.Time
	

	Items []CartItem
}

type CartItem struct {
	ID        uuid.UUID
	CartID    uuid.UUID
	ProductID uuid.UUID
	Quantity  int
	Price     float64
}
