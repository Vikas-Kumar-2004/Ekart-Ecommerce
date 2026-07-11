package review

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) AddReview(ctx context.Context, userID uuid.UUID, req *CreateReviewRequest) (*ReviewResponse, error) {
	// Database has a UNIQUE constraint on (product_id, user_id).
	// If a user tries to review twice, the DB will return a duplicate key error, 
	// which will bubble up. We could also check it here manually, but the DB constraint handles it.

	rev := &Review{
		ID:        uuid.New(),
		ProductID: req.ProductID,
		UserID:    userID,
		Rating:    req.Rating,
		Comment:   req.Comment,
	}

	if err := s.repo.Create(ctx, rev); err != nil {
		return nil, err
	}

	// For a complete response, ideally we fetch the newly created review with user details.
	// We'll return nil for the response for now, the handler can just send a success message.
	// Or we can fetch it via GetByID (but GetByID doesn't join with users table in our repo).
	// For simplicity, we just return nil and the handler sends "Review added successfully".
	return nil, nil
}

func (s *service) UpdateReview(ctx context.Context, userID uuid.UUID, userRole string, reviewID uuid.UUID, req *UpdateReviewRequest) (*ReviewResponse, error) {
	// 1. Fetch the review to check ownership
	existing, err := s.repo.GetByID(ctx, reviewID)
	if err != nil {
		return nil, errors.New("review not found")
	}

	// 2. Permission check: Only the owner can update their review.
	if existing.UserID != userID {
		return nil, errors.New("unauthorized: you can only update your own review")
	}

	// 3. Update
	existing.Rating = req.Rating
	existing.Comment = req.Comment

	if err := s.repo.Update(ctx, existing); err != nil {
		return nil, err
	}

	return nil, nil // Handler will return success message
}

func (s *service) DeleteReview(ctx context.Context, userID uuid.UUID, userRole string, reviewID uuid.UUID) error {
	// 1. Fetch the review
	existing, err := s.repo.GetByID(ctx, reviewID)
	if err != nil {
		return errors.New("review not found")
	}

	// 2. Permission check: Admin can delete ANY review. Normal user can only delete THEIR review.
	if userRole != "admin" && existing.UserID != userID {
		return errors.New("unauthorized: you can only delete your own review")
	}

	// 3. Delete
	return s.repo.Delete(ctx, reviewID)
}

func (s *service) GetReviewsByProduct(ctx context.Context, productID uuid.UUID) ([]*ReviewResponse, error) {
	return s.repo.GetByProductID(ctx, productID)
}
