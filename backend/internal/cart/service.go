package cart

import (
	"context"
	"errors"
	"go-ekart/internal/product"
	"go-ekart/pkg/cloudinary"

	"github.com/google/uuid"
)

type service struct {
	repo        Repository
	cdn         *cloudinary.Client
	productRepo product.Repository
}

var _ Service = &service{}

func NewService(repo Repository, cdn *cloudinary.Client, productRepo product.Repository) Service {
	return &service{repo: repo, cdn: cdn, productRepo: productRepo}
}

func (s *service) GetCart(ctx context.Context, userID uuid.UUID) (*CartResponse, error) {
	cart, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return &CartResponse{Items: []CartItemResponse{}}, nil
	}

	return s.toCartResponse(ctx, cart), nil
}

func (s *service) AddToCart(ctx context.Context, userID uuid.UUID, req *AddToCartRequest) (*CartResponse, error) {
	// 1. product exist karta hai? — product repo chahiye inject karo
	product, err := s.productRepo.GetByID(ctx, req.ProductID)
	if err != nil || product == nil {
		return nil, errors.New("product not found")
	}

	// Default quantity to 1 if not provided or less than 1
	qty := req.Quantity
	if qty < 1 {
		qty = 1
	}

	// 2. user ka cart dhundho
	cart, err := s.repo.GetByUserID(ctx, userID)

	// 3. cart nahi hai — naya banao
	if err != nil || cart == nil {
		newCartID := uuid.New()
		newCart := &Cart{
			ID:         newCartID,
			UserID:     userID,
			TotalPrice: product.ProductPrice * float64(qty),
			Items: []CartItem{
				{
					ID:        uuid.New(),
					CartID:    newCartID,
					ProductID: req.ProductID,
					Quantity:  qty,
					Price:     product.ProductPrice,
				},
			},
		}
		if err := s.repo.Create(ctx, newCart); err != nil {
			return nil, err
		}
		// items save karo
		if err := s.repo.AddItem(ctx, &newCart.Items[0]); err != nil {
			return nil, err
		}
		return s.toCartResponse(ctx, newCart), nil
	}

	// 4. cart hai — product already hai?
	itemIndex := -1
	for i, item := range cart.Items {
		if item.ProductID == req.ProductID {
			itemIndex = i
			break
		}
	}

	if itemIndex > -1 {
		// product already hai — quantity badhao
		cart.Items[itemIndex].Quantity += qty
		if err := s.repo.UpdateItemQuantity(ctx, cart.ID, req.ProductID, cart.Items[itemIndex].Quantity); err != nil {
			return nil, err
		}
	} else {
		// naya product — push karo
		newItem := CartItem{
			ID:        uuid.New(),
			CartID:    cart.ID,
			ProductID: req.ProductID,
			Quantity:  qty,
			Price:     product.ProductPrice,
		}
		if err := s.repo.AddItem(ctx, &newItem); err != nil {
			return nil, err
		}
		cart.Items = append(cart.Items, newItem)
	}

	var total float64
	for _, item := range cart.Items {
		total += item.Price * float64(item.Quantity)
	}
	if err := s.repo.UpdateTotalPrice(ctx, cart.ID, total); err != nil {
		return nil, err
	}
	cart.TotalPrice = total

	// 6. populated cart return karo
	updatedCart, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return s.toCartResponse(ctx, updatedCart), nil
}

func (s *service) UpdateQuantity(ctx context.Context, userID uuid.UUID, req *UpdateQuantityRequest) (*CartResponse, error) {
	// 1. cart dhundho
	cart, err := s.repo.GetByUserID(ctx, userID)
	if err != nil || cart == nil {
		return nil, errors.New("cart not found")
	}

	// 2. item dhundho — JS ka cart.items.find(...)
	itemIndex := -1
	for i, item := range cart.Items {
		if item.ProductID == req.ProductID {
			itemIndex = i
			break
		}
	}
	if itemIndex == -1 {
		return nil, errors.New("item not found")
	}

	// 3. increase ya decrease — JS ka type check
	switch req.Type {
	case "increase":
		cart.Items[itemIndex].Quantity += 1
	case "decrease":
		if cart.Items[itemIndex].Quantity > 1 {
			cart.Items[itemIndex].Quantity -= 1
		}
	default:
		return nil, errors.New("invalid type — use 'increase' or 'decrease'")
	}

	// 4. DB mein quantity update karo
	if err := s.repo.UpdateItemQuantity(ctx, cart.ID, req.ProductID, cart.Items[itemIndex].Quantity); err != nil {
		return nil, err
	}

	// 5. total recalculate — JS ka cart.items.reduce(...)
	var total float64
	for _, item := range cart.Items {
		total += item.Price * float64(item.Quantity)
	}
	if err := s.repo.UpdateTotalPrice(ctx, cart.ID, total); err != nil {
		return nil, err
	}

	// 6. fresh cart return karo — JS ka cart.populate(...)
	updatedCart, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return s.toCartResponse(ctx, updatedCart), nil
}

func (s *service) RemoveFromCart(ctx context.Context, userID uuid.UUID, req *RemoveFromCartRequest) (*CartResponse, error) {
	// 1. cart dhundho
	cart, err := s.repo.GetByUserID(ctx, userID)
	if err != nil || cart == nil {
		return nil, errors.New("cart not found")
	}

	// 2. item remove karo — JS ka cart.items.filter(...)
	if err := s.repo.RemoveItem(ctx, cart.ID, req.ProductID); err != nil {
		return nil, err
	}

	// 3. remaining items se total recalculate karo — JS ka cart.items.reduce(...)
	var total float64
	for _, item := range cart.Items {
		if item.ProductID != req.ProductID { // removed item skip karo
			total += item.Price * float64(item.Quantity)
		}
	}
	if err := s.repo.UpdateTotalPrice(ctx, cart.ID, total); err != nil {
		return nil, err
	}

	// 4. fresh populated cart return karo — JS ka cart.populate(...)
	updatedCart, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return s.toCartResponse(ctx, updatedCart), nil
}

// ── Helper ────────────────────────────────────────────────────────────────────
func (s *service) toCartResponse(ctx context.Context, c *Cart) *CartResponse {
	var items []CartItemResponse
	for _, item := range c.Items {
		// Populate the product details
		p, err := s.productRepo.GetByID(ctx, item.ProductID)
		
		popProduct := PopulatedProduct{
			ID: item.ProductID,
		}
		if err == nil && p != nil {
			popProduct.ProductName = p.ProductName
			popProduct.ProductPrice = p.ProductPrice
			if len(p.Images) > 0 {
				popProduct.ProductImg = append(popProduct.ProductImg, struct {
					URL string `json:"url"`
				}{URL: p.Images[0].URL})
			}
		}

		items = append(items, CartItemResponse{
			ID:        item.ID,
			ProductID: popProduct,
			Quantity:  item.Quantity,
			Price:     item.Price,
		})
	}
	return &CartResponse{ID: c.ID, UserID: c.UserID, Items: items, TotalPrice: c.TotalPrice}
}
