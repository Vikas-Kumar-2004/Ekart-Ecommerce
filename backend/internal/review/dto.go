package review

import (
	"time"

	"github.com/google/uuid"
)

type CreateReviewRequest struct {
	ProductID uuid.UUID `json:"productId" binding:"required"`
	Rating    int       `json:"rating" binding:"required,min=1,max=5"`
	Comment   string    `json:"comment" binding:"required"`
}

type UpdateReviewRequest struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment" binding:"required"`
}

type ReviewResponse struct {
	ID        uuid.UUID `json:"id"`
	ProductID uuid.UUID `json:"productId"`
	UserID    uuid.UUID `json:"userId"`
	FirstName string    `json:"firstName"` // Jo user table se fetch karenge
	LastName  string    `json:"lastName"`  // Jo user table se fetch karenge
	Rating    int       `json:"rating"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
