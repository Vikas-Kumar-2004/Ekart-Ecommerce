package user

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                 uuid.UUID
	FirstName          string
	LastName           string
	ProfilePic         string
	ProfilePicPublicID string
	Email              string
	Password           string
	Role               string
	Token              *string
	RefreshToken       *string
	IsVerified         bool
	IsLoggedIn         bool
	OTP                *string
	OTPExpiry          *time.Time
	Address            *string
	City               *string
	ZipCode            *string
	PhoneNo            *string
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

type Session struct {
	ID           uuid.UUID
	UserID       uuid.UUID
	RefreshToken string
	IsActive     bool
	ExpiresAt    time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
