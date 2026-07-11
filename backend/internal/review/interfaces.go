package review

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, review *Review) error
	GetByID(ctx context.Context, id uuid.UUID) (*Review, error)
	GetByProductID(ctx context.Context, productID uuid.UUID) ([]*ReviewResponse, error)
	Update(ctx context.Context, review *Review) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type Service interface {
	AddReview(ctx context.Context, userID uuid.UUID, req *CreateReviewRequest) (*ReviewResponse, error)
	UpdateReview(ctx context.Context, userID uuid.UUID, userRole string, reviewID uuid.UUID, req *UpdateReviewRequest) (*ReviewResponse, error)
	DeleteReview(ctx context.Context, userID uuid.UUID, userRole string, reviewID uuid.UUID) error
	GetReviewsByProduct(ctx context.Context, productID uuid.UUID) ([]*ReviewResponse, error)
}
