package session

import (
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID           uuid.UUID
	UserID       uuid.UUID
	RefreshToken string
	IsActive     bool
	ExpiresAt    time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
