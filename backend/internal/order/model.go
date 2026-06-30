package order

import (
	"time"

	"github.com/google/uuid"
)

type OrderStatus string

const (
	StatusPending   OrderStatus = "Pending"
	StatusPaid      OrderStatus = "Paid"
	StatusFailed    OrderStatus = "Failed"
	StatusShipped   OrderStatus = "Shipped"
	StatusDelivered OrderStatus = "Delivered"
)

type Order struct {
	ID                uuid.UUID
	UserID            uuid.UUID
	Amount            float64
	Tax               float64
	Shipping          float64
	Currency          string
	Status            OrderStatus
	RazorpayOrderID   *string
	RazorpayPaymentID *string
	RazorpaySignature *string
	CreatedAt         time.Time
	UpdatedAt         time.Time

	Items     []OrderItem
	UserName  string
	UserEmail string
}

type OrderItem struct {
	ID          uuid.UUID
	OrderID     uuid.UUID
	ProductID   uuid.UUID
	Quantity    int
	Price       float64
	ProductName string
}
