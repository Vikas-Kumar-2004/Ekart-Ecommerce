package order

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"go-ekart/internal/cart"
	"math"
	"time"

	"github.com/google/uuid"
	razorpay "github.com/razorpay/razorpay-go"
)

type service struct {
	repo     Repository
	razorpay *razorpay.Client // inject karo
	cartRepo cart.Repository
	rpSecret string
}

var _ Service = &service{}

func NewService(repo Repository, cartRepo cart.Repository, rp *razorpay.Client, rpSecret string) Service {
	return &service{
		repo:     repo,
		cartRepo: cartRepo,
		razorpay: rp,
		rpSecret: rpSecret,
	}
}

func (s *service) CreateOrder(ctx context.Context, userID uuid.UUID, req *CreateOrderRequest) (*CreateOrderResponse, error) {
	// 1. Razorpay order banao — JS ka razorpayInstance.orders.create(options)
	amountInPaise := int64(math.Round(req.Amount * 100)) // JS ka Math.round(amount * 100)
	currency := req.Currency
	if currency == "" {
		currency = "INR"
	}

	rpData := map[string]any{
		"amount":   amountInPaise,
		"currency": currency,
		"receipt":  fmt.Sprintf("receipt_%d", time.Now().UnixMilli()), // JS ka receipt_${Date.now()}
	}

	var rpOrder map[string]any

	// MOCK MODE: Bypass Razorpay API if using placeholder credentials
	if s.rpSecret == "testsecret1234567890" || s.rpSecret == "" {
		rpOrder = map[string]any{
			"id":      fmt.Sprintf("order_mock_%d", time.Now().UnixMilli()),
			"receipt": rpData["receipt"],
		}
	} else {
		// ACTUAL API CALL
		var err error
		rpOrder, err = s.razorpay.Order.Create(rpData, nil)
		if err != nil {
			return nil, err
		}
	}

	// 2. DB mein order save karo
	rpOrderID := rpOrder["id"].(string)
	newOrder := &Order{
		ID:              uuid.New(),
		UserID:          userID,
		Amount:          req.Amount,
		Tax:             req.Tax,
		Shipping:        req.Shipping,
		Currency:        currency,
		Status:          StatusPending,
		RazorpayOrderID: &rpOrderID,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := s.repo.Create(ctx, newOrder); err != nil {
		return nil, err
	}

	// 3. order products save karo
	var orderItems []OrderItem
	for _, p := range req.Products {
		orderItems = append(orderItems, OrderItem{
			ID:        uuid.New(),
			OrderID:   newOrder.ID,
			ProductID: p.ProductID,
			Quantity:  p.Quantity,
			Price:     p.Price,
		})
	}
	if err := s.repo.SaveProducts(ctx, orderItems); err != nil {
		return nil, err
	}

	// 4. cart clear karo - ab CreateOrder me hoga so that Pay Later wale users ka cart clear ho
	cartData, err := s.cartRepo.GetByUserID(ctx, userID)
	if err == nil && cartData != nil {
		s.repo.ClearCart(ctx, cartData.ID)
	}

	return &CreateOrderResponse{
		RazorpayOrder: RazorpayOrderResponse{
			ID:       rpOrder["id"].(string),
			Amount:   amountInPaise,
			Currency: currency,
			Receipt:  rpOrder["receipt"].(string),
		},
		DBOrder: newOrder,
	}, nil
}

func (s *service) VerifyPayment(ctx context.Context, userID uuid.UUID, req *VerifyPaymentRequest) (*Order, error) {
	// 1. payment failed/cancelled — JS ka if (paymentFailed)
	if req.PaymentFailed {
		order, err := s.repo.UpdateStatus(ctx, req.RazorpayOrderID, StatusFailed)
		if err != nil {
			return nil, err
		}
		return order, errors.New("payment failed")
	}

	// 2. signature verify karo — JS ka crypto.createHmac("sha256", secret)
	// MOCK MODE: Bypass verification if using placeholder credentials
	if s.rpSecret != "testsecret1234567890" && s.rpSecret != "" {
		body := req.RazorpayOrderID + "|" + req.RazorpayPaymentID
		mac := hmac.New(sha256.New, []byte(s.rpSecret))
		mac.Write([]byte(body))
		expectedSignature := hex.EncodeToString(mac.Sum(nil))

		// 3. signature match — JS ka if (expectedSignature === razorpay_signature)
		if expectedSignature != req.RazorpaySignature {
			s.repo.UpdateStatus(ctx, req.RazorpayOrderID, StatusFailed)
			return nil, errors.New("invalid signature")
		}
	}

	// 4. order paid mark karo
	order, err := s.repo.UpdatePayment(ctx, req.RazorpayOrderID, req.RazorpayPaymentID, req.RazorpaySignature)
	if err != nil {
		return nil, err
	}

	return order, nil
}

func (s *service) GetAllOrders(ctx context.Context) ([]*OrderResponse, error) {
	orders, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	response := make([]*OrderResponse, 0)
	for _, o := range orders {
		response = append(response, toOrderResponse(o))
	}
	return response, nil
}

func (s *service) UpdateOrderStatus(ctx context.Context, orderID uuid.UUID, req *UpdateOrderStatusRequest) error {
	// 1. Valid status check
	validStatuses := []OrderStatus{StatusPending, StatusProcessing, StatusShipped, StatusDelivered}
	isValid := false
	for _, st := range validStatuses {
		if req.Status == st {
			isValid = true
			break
		}
	}
	if !isValid {
		return errors.New("invalid order status")
	}

	// 2. Check if order exists
	order, err := s.repo.GetByID(ctx, orderID)
	if err != nil || order == nil {
		return errors.New("order not found")
	}

	// 3. Update status
	return s.repo.UpdateStatusByID(ctx, orderID, req.Status)
}

// ── Helper ────────────────────────────────────────────────────────────────────
func toOrderResponse(o *Order) *OrderResponse {
	items := make([]OrderItemResponse, 0)
	for _, item := range o.Items {
		items = append(items, OrderItemResponse{
			ProductID:   item.ProductID,
			ProductName: item.ProductName,
			Price:       item.Price,
			Quantity:    item.Quantity,
		})
	}
	return &OrderResponse{
		ID: o.ID,
		User: OrderUserInfo{
			ID:    o.UserID,
			Name:  o.UserName,
			Email: o.UserEmail,
		},
		Items:             items,
		Amount:            o.Amount,
		Tax:               o.Tax,
		Shipping:          o.Shipping,
		Currency:          o.Currency,
		Status:            o.Status,
		RazorpayOrderID:   o.RazorpayOrderID,
		RazorpayPaymentID: o.RazorpayPaymentID,
		CreatedAt:         o.CreatedAt,
	}
}

func (s *service) GetUserOrders(ctx context.Context, userID uuid.UUID) ([]*OrderResponse, error) {
    orders, err := s.repo.GetByUserIDDetailed(ctx, userID)
    if err != nil {
        return nil, err
    }

    response := make([]*OrderResponse, 0)
    for _, o := range orders {
        response = append(response, toOrderResponse(o)) // pichla helper reuse
    }
    return response, nil
}
