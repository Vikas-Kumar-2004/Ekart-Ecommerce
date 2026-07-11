package order

import (
	"time"

	"github.com/google/uuid"
)

type CreateOrderRequest struct {
	Products []OrderItemRequest `json:"products"`
	Amount   float64            `json:"amount"`
	Tax      float64            `json:"tax"`
	Shipping float64            `json:"shipping"`
	Currency string             `json:"currency"`
}

type OrderItemRequest struct {
	ProductID uuid.UUID `json:"productId"`
	Quantity  int       `json:"quantity"`
	Price     float64   `json:"price"`
}

type VerifyPaymentRequest struct {
	RazorpayOrderID   string `json:"razorpay_order_id"`
	RazorpayPaymentID string `json:"razorpay_payment_id"`
	RazorpaySignature string `json:"razorpay_signature"`
	PaymentFailed     bool   `json:"paymentFailed"`
}

type OrderResponse struct {
	ID                uuid.UUID           `json:"id"`
	User              OrderUserInfo       `json:"user"`
	Items             []OrderItemResponse `json:"products"`
	Amount            float64             `json:"amount"`
	Tax               float64             `json:"tax"`
	Shipping          float64             `json:"shipping"`
	Currency          string              `json:"currency"`
	Status            OrderStatus         `json:"status"`
	RazorpayOrderID   *string             `json:"razorpayOrderId"`
	RazorpayPaymentID *string             `json:"razorpayPaymentId"`
	CreatedAt         time.Time           `json:"createdAt"`
}

type OrderItemResponse struct {
	ProductID   uuid.UUID `json:"productId"`
	ProductName string    `json:"productName"`
	Price       float64   `json:"price"`
	Quantity    int       `json:"quantity"`
}

type OrderProductRequest struct {
	ProductID uuid.UUID `json:"productId"`
	Quantity  int       `json:"quantity"`
	Price     float64   `json:"price"`
}

type RazorpayOrderResponse struct {
	ID       string `json:"id"`
	Amount   int64  `json:"amount"`
	Currency string `json:"currency"`
	Receipt  string `json:"receipt"`
}

type CreateOrderResponse struct {
	RazorpayOrder RazorpayOrderResponse `json:"order"`   // frontend ko razorpay details
	DBOrder       *Order                `json:"dbOrder"` // saved order
}

type OrderUserInfo struct {
	ID    uuid.UUID `json:"id"`
	Name  string    `json:"name"`
	Email string    `json:"email"`
}

type UpdateOrderStatusRequest struct {
	Status OrderStatus `json:"status" binding:"required"`
}
