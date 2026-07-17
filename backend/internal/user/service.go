package user

import (
	"bytes"
	"context"
	"errors"
	"time"

	"go-ekart/internal/utils"

	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type service struct {
	repo Repository
}

// compile-time check
var _ Service = &service{}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// ─── Register ─────────────────────────────────────────────────────────────────

func (s *service) Register(ctx context.Context, req *RegisterRequest) (*UserResponse, error) {
	// 1. validation (handler mein bhi hogi, service mein extra safety)
	if req.FirstName == "" || req.LastName == "" || req.Email == "" || req.Password == "" {
		return nil, errors.New("all fields are required")
	}

	// 2. check if user already exists
	existing, _ := s.repo.GetByEmail(ctx, req.Email)
	if existing != nil {
		return nil, errors.New("user already exists")
	}

	// 3. hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		return nil, err
	}

	// 4. create user
	newUser := &User{
		ID:         uuid.New(),
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		Email:      req.Email,
		Password:   string(hashedPassword),
		Role:       "user",
		IsVerified: false,
		IsLoggedIn: true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	token, refreshToken, err := utils.TokenGenerator(newUser.Email, newUser.FirstName, newUser.LastName, newUser.ID.String(), newUser.Role)
	if err != nil {
		return nil, err
	}
	newUser.Token = &token
	newUser.RefreshToken = &refreshToken

	if err := s.repo.Create(ctx, newUser); err != nil {
		return nil, err
	}

	newSession := &Session{
		ID:           uuid.New(),
		UserID:       newUser.ID,
		RefreshToken: refreshToken,
		IsActive:     true,
		ExpiresAt:    time.Now().Add(7 * 24 * time.Hour),
	}
	if err := s.repo.CreateSession(ctx, newSession); err != nil {
		return nil, err
	}

	// 5. send OTP/verify email — yahan call karo apna email util
	// utils.SendVerificationEmail(newUser.Email)

	return toUserResponse(newUser), nil
}

func (s *service) CreateAdmin(ctx context.Context, req *RegisterRequest) (*UserResponse, error) {
	if req.FirstName == "" || req.LastName == "" || req.Email == "" || req.Password == "" {
		return nil, errors.New("all fields are required")
	}

	existing, _ := s.repo.GetByEmail(ctx, req.Email)
	if existing != nil {
		return nil, errors.New("user already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		return nil, err
	}

	newUser := &User{
		ID:         uuid.New(),
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		Email:      req.Email,
		Password:   string(hashedPassword),
		Role:       "admin",
		IsVerified: true,
		IsLoggedIn: false, // Don't log them in automatically upon creation
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// No token generation for CreateAdmin since they are not logging in immediately

	if err := s.repo.Create(ctx, newUser); err != nil {
		return nil, err
	}

	return toUserResponse(newUser), nil
}

// ─── Login ────────────────────────────────────────────────────────────────────

func (s *service) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	// 1. user dhundho
	u, err := s.repo.GetByEmail(ctx, req.Email)
	if err != nil || u == nil {
		return nil, errors.New("invalid email or password")
	}

	// 2. password check
	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// 3. JWT token banao
	token, refreshToken, err := utils.TokenGenerator(u.Email, u.FirstName, u.LastName, u.ID.String(), u.Role)
	if err != nil {
		return nil, err
	}

	u.Token = &token
	u.RefreshToken = &refreshToken
	u.IsLoggedIn = true
	u.UpdatedAt = time.Now()

	if err := s.repo.Update(ctx, u); err != nil {
		return nil, err
	}

	newSession := &Session{
		ID:           uuid.New(),
		UserID:       u.ID,
		RefreshToken: refreshToken,
		IsActive:     true,
		ExpiresAt:    time.Now().Add(7 * 24 * time.Hour),
	}
	if err := s.repo.CreateSession(ctx, newSession); err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         *toUserResponse(u),
	}, nil
}

func (s *service) Logout(ctx context.Context, userID uuid.UUID) error {
	if err := s.repo.DeleteSession(ctx, userID); err != nil {
		return err
	}
	if err := s.repo.UpdateLogoutStatus(ctx, userID); err != nil {
		return err
	}
	return nil
}

func (s *service) RefreshToken(ctx context.Context, req *RefreshTokenRequest) (*RefreshTokenResponse, error) {
	// 1. Validate the refresh token
	claims, err := utils.ValidateToken(req.RefreshToken)
	if err != nil {
		return nil, errors.New("invalid or expired refresh token")
	}

	// 2. Check if the session exists and is active in DB
	session, err := s.repo.GetSessionByRefreshToken(ctx, req.RefreshToken)
	if err != nil || session == nil || !session.IsActive {
		return nil, errors.New("invalid session")
	}

	if session.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("session expired")
	}

	// 3. Ensure the user exists
	u, err := s.repo.GetByID(ctx, session.UserID)
	if err != nil || u == nil {
		return nil, errors.New("user not found")
	}

	// verify claims match user
	if u.Email != claims.Email {
		return nil, errors.New("token claims mismatch")
	}

	// 4. Generate new tokens
	token, newRefreshToken, err := utils.TokenGenerator(u.Email, u.FirstName, u.LastName, u.ID.String(), u.Role)
	if err != nil {
		return nil, err
	}

	// 5. Update session in DB (Token rotation)
	session.RefreshToken = newRefreshToken
	session.ExpiresAt = time.Now().Add(7 * 24 * time.Hour)

	if err := s.repo.UpdateSession(ctx, session); err != nil {
		return nil, err
	}

	// 6. Update user record with new tokens
	u.Token = &token
	u.RefreshToken = &newRefreshToken
	u.UpdatedAt = time.Now()
	if err := s.repo.Update(ctx, u); err != nil {
		return nil, err
	}

	return &RefreshTokenResponse{
		Token:        token,
		RefreshToken: newRefreshToken,
	}, nil
}

func (s *service) ForgotPassword(ctx context.Context, req *ForgotPasswordRequest) error {
	// 1. user dhundho
	u, err := s.repo.GetByEmail(ctx, req.Email)
	if err != nil || u == nil {
		return errors.New("user not found")
	}

	// 2. Default OTP for verification
	otp := "123456"

	// 3. expiry set karo — 10 mins
	expiry := time.Now().Add(10 * time.Minute)

	// 4. user update karo
	u.OTP = &otp
	u.OTPExpiry = &expiry
	if err := s.repo.Update(ctx, u); err != nil {
		return err
	}

	// 5. mail bhejo — apna sendOTPMail util yahan call karo
	// utils.SendOTPMail(otp, u.Email)

	return nil
}

func (s *service) ChangePassword(ctx context.Context, email string, req *ChangePasswordRequest) error {
	// 1. user dhundho
	u, err := s.repo.GetByEmail(ctx, email)
	if err != nil || u == nil {
		return errors.New("user not found")
	}

	// 2. fields check
	if req.NewPassword == "" || req.ConfirmPassword == "" {
		return errors.New("all fields are required")
	}

	// 3. password match check
	if req.NewPassword != req.ConfirmPassword {
		return errors.New("passwords do not match")
	}

	// 4. hash karo
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 10)
	if err != nil {
		return err
	}

	// 5. update karo
	u.Password = string(hashedPassword)
	return s.repo.Update(ctx, u)
}

func (s *service) GetProfile(ctx context.Context, id uuid.UUID) (*UserResponse, error) {
	u, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toUserResponse(u), nil
}

func (s *service) UpdateProfile(ctx context.Context, id uuid.UUID, req *UpdateUserRequest) (*UserResponse, error) {
	u, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	u.FirstName = req.FirstName
	u.LastName = req.LastName
	u.Address = &req.Address
	u.City = &req.City
	u.ZipCode = &req.ZipCode
	u.PhoneNo = &req.PhoneNo
	u.UpdatedAt = time.Now()

	if err := s.repo.Update(ctx, u); err != nil {
		return nil, err
	}
	return toUserResponse(u), nil
}

func (s *service) UpdateUser(ctx context.Context, loggedInID uuid.UUID, loggedInRole string, targetID uuid.UUID, req *UpdateUserRequest, file []byte) (*UserResponse, error) {
	// 1. permission check — sirf self ya admin update kar sakta hai
	if loggedInID != targetID && loggedInRole != "admin" {
		return nil, errors.New("you are not allowed to update this profile")
	}

	// 2. user dhundho
	u, err := s.repo.GetByID(ctx, targetID)
	if err != nil || u == nil {
		return nil, errors.New("user not found")
	}

	// 3. cloudinary upload agar file hai
	if len(file) > 0 && utils.Cloudinary != nil {
		// purani pic delete karo
		if u.ProfilePicPublicID != "" {
			_, _ = utils.Cloudinary.Upload.Destroy(ctx, uploader.DestroyParams{PublicID: u.ProfilePicPublicID})
		}

		// nayi pic upload karo
		result, err := utils.Cloudinary.Upload.Upload(ctx, bytes.NewReader(file), uploader.UploadParams{
			Folder: "profiles",
		})
		if err == nil {
			u.ProfilePic = result.SecureURL
			u.ProfilePicPublicID = result.PublicID
		}
	}

	if req.FirstName != "" {
		u.FirstName = req.FirstName
	}
	if req.LastName != "" {
		u.LastName = req.LastName
	}
	if req.Address != "" {
		u.Address = &req.Address
	}
	if req.City != "" {
		u.City = &req.City
	}
	if req.ZipCode != "" {
		u.ZipCode = &req.ZipCode
	}
	if req.PhoneNo != "" {
		u.PhoneNo = &req.PhoneNo
	}
	if req.Role != "" {
		u.Role = req.Role
	}
	u.UpdatedAt = time.Now()

	if err := s.repo.Update(ctx, u); err != nil {
		return nil, err
	}

	return toUserResponse(u), nil
}

func (s *service) VerifyOTP(ctx context.Context, req *VerifyOTPRequest) error {
	u, err := s.repo.GetByEmail(ctx, req.Email)
	if err != nil || u == nil {
		return errors.New("user not found")
	}

	if u.OTP == nil || *u.OTP != req.OTP {
		return errors.New("invalid OTP")
	}

	if u.OTPExpiry == nil || time.Now().After(*u.OTPExpiry) {
		return errors.New("OTP has expired")
	}

	// OTP is valid! Mark user as verified and clear OTP fields
	u.IsVerified = true
	u.OTP = nil
	u.OTPExpiry = nil

	if err := s.repo.Update(ctx, u); err != nil {
		return err
	}

	return nil
}

func (s *service) GetAllUsers(ctx context.Context) ([]*UserResponse, error) {
	users, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	var response []*UserResponse
	for _, u := range users {
		response = append(response, toUserResponse(u))
	}
	return response, nil
}

func (s *service) GetAllAdmins(ctx context.Context, searchQuery string) ([]*UserResponse, error) {
	admins, err := s.repo.GetAllAdmins(ctx, searchQuery)
	if err != nil {
		return nil, err
	}

	var response []*UserResponse
	for _, u := range admins {
		response = append(response, toUserResponse(u))
	}
	return response, nil
}

func (s *service) DeleteAdmin(ctx context.Context, adminID uuid.UUID, targetID uuid.UUID) error {
	// 1. Prevent self-deletion
	if adminID == targetID {
		return errors.New("cannot delete yourself")
	}

	// 2. Ensure target is actually an admin
	targetUser, err := s.repo.GetByID(ctx, targetID)
	if err != nil || targetUser == nil {
		return errors.New("admin not found")
	}

	if targetUser.Role != "admin" {
		return errors.New("target is not an admin")
	}

	// 3. Delete the admin
	return s.repo.Delete(ctx, targetID)
}

func (s *service) GetUserByID(ctx context.Context, id uuid.UUID) (*UserResponse, error) {
	u, err := s.repo.GetByID(ctx, id)
	if err != nil || u == nil {
		return nil, errors.New("user not found")
	}

	// sensitive fields automatically exclude ho jaate hain toUserResponse mein
	// password, otp, otpExpiry, token — UserResponse mein hain hi nahi ✅
	return toUserResponse(u), nil
}

// ─── Helper ───────────────────────────────────────────────────────────────────

func toUserResponse(u *User) *UserResponse {
	resp := &UserResponse{
		ID:         u.ID,
		FirstName:  u.FirstName,
		LastName:   u.LastName,
		Email:      u.Email,
		ProfilePic: u.ProfilePic,
		Role:       u.Role,
		IsVerified: u.IsVerified,
		IsLoggedIn: u.IsLoggedIn,
	}

	if u.Address != nil {
		resp.Address = *u.Address
	}
	if u.City != nil {
		resp.City = *u.City
	}
	if u.ZipCode != nil {
		resp.ZipCode = *u.ZipCode
	}
	if u.PhoneNo != nil {
		resp.PhoneNo = *u.PhoneNo
	}
	if u.Token != nil {
		resp.Token = *u.Token
	}
	if u.RefreshToken != nil {
		resp.RefreshToken = *u.RefreshToken
	}

	return resp
}
