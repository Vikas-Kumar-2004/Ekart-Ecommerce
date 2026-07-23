package order

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, order *Order) error
	SaveProducts(ctx context.Context, products []OrderItem) error
	GetByID(ctx context.Context, id uuid.UUID) (*Order, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]*Order, error)
	UpdateStatus(ctx context.Context, razorpayOrderID string, status OrderStatus) (*Order, error)
	UpdateStatusByID(ctx context.Context, id uuid.UUID, status OrderStatus) error
	UpdatePayment(ctx context.Context, razorpayOrderID, paymentID, signature string) (*Order, error)
	ClearCart(ctx context.Context, cartID uuid.UUID) error
	GetAll(ctx context.Context, page, limit int) ([]*Order, int, error)
	GetByUserIDDetailed(ctx context.Context, userID uuid.UUID) ([]*Order, error)
}

type Service interface {
	CreateOrder(ctx context.Context, userID uuid.UUID, req *CreateOrderRequest) (*CreateOrderResponse, error)
	VerifyPayment(ctx context.Context, userID uuid.UUID, req *VerifyPaymentRequest) (*Order, error)
	GetAllOrders(ctx context.Context, page, limit int) ([]*OrderResponse, int, error)
	GetUserOrders(ctx context.Context, userID uuid.UUID) ([]*OrderResponse, error)
	UpdateOrderStatus(ctx context.Context, orderID uuid.UUID, req *UpdateOrderStatusRequest) error
}
