package cart

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	GetByUserID(ctx context.Context, userID uuid.UUID) (*Cart, error)
	Create(ctx context.Context, cart *Cart) error
	AddItem(ctx context.Context, item *CartItem) error
	UpdateItemQuantity(ctx context.Context, cartID, productID uuid.UUID, quantity int) error
	UpdateTotalPrice(ctx context.Context, cartID uuid.UUID, total float64) error
	RemoveItem(ctx context.Context, cartID, productID uuid.UUID) error
}

type Service interface {
	GetCart(ctx context.Context, userID uuid.UUID) (*CartResponse, error)
	AddToCart(ctx context.Context, userID uuid.UUID, req *AddToCartRequest) (*CartResponse, error)
	UpdateQuantity(ctx context.Context, userID uuid.UUID, req *UpdateQuantityRequest) (*CartResponse, error)
	RemoveFromCart(ctx context.Context, userID uuid.UUID, req *RemoveFromCartRequest) (*CartResponse, error)
}
