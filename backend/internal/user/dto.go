package user

import "github.com/google/uuid"

type RegisterRequest struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UpdateUserRequest struct {
    FirstName string `json:"firstName"`
    LastName  string `json:"lastName"`
    Address   string `json:"address"`
    City      string `json:"city"`
    ZipCode   string `json:"zipCode"`
    PhoneNo   string `json:"phoneNo"`
    Role      string `json:"role"`
}

type ForgotPasswordRequest struct {
    Email string `json:"email"`
}

type VerifyOTPRequest struct {
	Email string `json:"email"`
	OTP   string `json:"otp"`
}

type ChangePasswordRequest struct {
    NewPassword     string `json:"newPassword"`
    ConfirmPassword string `json:"confirmPassword"`
}

type UserResponse struct {
	ID           uuid.UUID `json:"id"`
	FirstName    string    `json:"firstName"`
	LastName     string    `json:"lastName"`
	ProfilePic   string    `json:"profilePic"`
	Email        string    `json:"email"`
	Role         string    `json:"role"`
	IsVerified   bool      `json:"isVerified"`
	Address      string    `json:"address,omitempty"`
	City         string    `json:"city,omitempty"`
	ZipCode      string    `json:"zipCode,omitempty"`
	PhoneNo      string    `json:"phoneNo,omitempty"`
	Token        string    `json:"token,omitempty"`
	RefreshToken string    `json:"refreshToken,omitempty"`
	IsLoggedIn   bool      	`json:"isLoggedIn"`
}

type LoginResponse struct {
	Token        string       `json:"token"`
	RefreshToken string       `json:"refreshToken"`
	User         UserResponse `json:"user"`
}
