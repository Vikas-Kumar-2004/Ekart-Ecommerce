package cart

import "github.com/google/uuid"

type AddToCartRequest struct {
	ProductID uuid.UUID `json:"productId"`
}

type UpdateCartItemRequest struct {
	ProductID uuid.UUID `json:"productId"`
	Quantity  int       `json:"quantity"`
}

type UpdateQuantityRequest struct {
	ProductID uuid.UUID `json:"productId"`
	Type      string    `json:"type"` // "increase" ya "decrease"
}

type RemoveFromCartRequest struct {
	ProductID uuid.UUID `json:"productId"`
}
type CartResponse struct {
	ID         uuid.UUID          `json:"id"`
	UserID     uuid.UUID          `json:"userId"`
	Items      []CartItemResponse `json:"items"`
	TotalPrice float64            `json:"totalPrice"`
}

type PopulatedProduct struct {
	ID           uuid.UUID `json:"id"`
	ProductName  string    `json:"productName"`
	ProductPrice float64   `json:"productPrice"`
	ProductImg   []struct {
		URL string `json:"url"`
	} `json:"productImg"`
}

type CartItemResponse struct {
	ID        uuid.UUID        `json:"id"`
	ProductID PopulatedProduct `json:"productId"`
	Quantity  int              `json:"quantity"`
	Price     float64          `json:"price"`
}
