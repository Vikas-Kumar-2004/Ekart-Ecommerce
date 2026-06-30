package user

import (
	"context"

	"github.com/google/uuid"
)

// ─── Repository Interface ─────────────────────────────────────────────────────

type Repository interface {
	Create(ctx context.Context, u *User) error
	GetByID(ctx context.Context, id uuid.UUID) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	Update(ctx context.Context, u *User) error
	Delete(ctx context.Context, id uuid.UUID) error
	CreateSession(ctx context.Context, session *Session) error
	DeleteSession(ctx context.Context, userID uuid.UUID) error
	UpdateLogoutStatus(ctx context.Context, userID uuid.UUID) error
	GetAll(ctx context.Context) ([]*User, error)
}

// ─── Service Interface ────────────────────────────────────────────────────────

type Service interface {
	Register(ctx context.Context, req *RegisterRequest) (*UserResponse, error)
	Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error)
	Logout(ctx context.Context, userID uuid.UUID) error
	GetProfile(ctx context.Context, id uuid.UUID) (*UserResponse, error)
	UpdateProfile(ctx context.Context, id uuid.UUID, req *UpdateUserRequest) (*UserResponse, error)
	UpdateUser(ctx context.Context, loggedInID uuid.UUID, loggedInRole string, targetID uuid.UUID, req *UpdateUserRequest, file []byte) (*UserResponse, error)
	VerifyOTP(ctx context.Context, req *VerifyOTPRequest) error
	ChangePassword(ctx context.Context, email string, req *ChangePasswordRequest) error
	ForgotPassword(ctx context.Context, req *ForgotPasswordRequest) error
	GetAllUsers(ctx context.Context) ([]*UserResponse, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*UserResponse, error)
}
