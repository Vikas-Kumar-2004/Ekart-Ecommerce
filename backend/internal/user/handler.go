package user

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	svc Service // apne package ka interface
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// ─── Register ─────────────────────────────────────────────────────────────────

// @Summary      Register user
// @Description  Naya user register karo
// @Tags         User
// @Accept       json
// @Produce      json
// @Param        request body RegisterRequest true "Register payload"
// @Success      201  {object}  map[string]any
// @Failure      400  {object}  map[string]any
// @Router       /users/register [post]
func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid request body",
		})
		return
	}

	user, err := h.svc.Register(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "User registered successfully",
		"user":    user,
	})
}

// ─── Login ────────────────────────────────────────────────────────────────────

// @Summary      Login user
// @Tags         User
// @Accept       json
// @Produce      json
// @Param        request body LoginRequest true "Login payload"
// @Success      200  {object}  LoginResponse
// @Failure      401  {object}  map[string]any
// @Router       /users/login [post]
func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid request body",
		})
		return
	}

	resp, err := h.svc.Login(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "Login successful",
		"token":        resp.Token,
		"refreshToken": resp.RefreshToken,
		"user":         resp.User,
	})
}

// ─── Logout ───────────────────────────────────────────────────────────────────
// @Summary      Logout user
// @Tags         User
// @Security     BearerAuth
// @Success      200  {object}  map[string]any
// @Failure      401  {object}  map[string]any
// @Failure      500  {object}  map[string]any
// @Router       /users/logout [post]
func (h *Handler) Logout(c *gin.Context) {
	userIDStr, exists := c.Get("uid")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "unauthorized"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid user id"})
		return
	}

	if err := h.svc.Logout(c.Request.Context(), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Logout successful"})
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
// @Summary      Refresh Token
// @Tags         User
// @Accept       json
// @Produce      json
// @Param        request body RefreshTokenRequest true "Refresh token payload"
// @Success      200  {object}  map[string]any
// @Failure      400  {object}  map[string]any
// @Router       /users/refresh-token [post]
func (h *Handler) RefreshToken(c *gin.Context) {
	var req RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid request body",
		})
		return
	}

	resp, err := h.svc.RefreshToken(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "Token refreshed successfully",
		"token":        resp.Token,
		"refreshToken": resp.RefreshToken,
	})
}

// ─── ForgotPassword ───────────────────────────────────────────────────────────────────
// @Summary      Forgot password
// @Tags         User
// @Accept       json
// @Produce      json
// @Param        request body ForgotPasswordRequest true "Forgot password payload"
// @Success      200  {object}  map[string]any
// @Failure      400  {object}  map[string]any
// @Failure      500  {object}  map[string]any
// @Router       /users/forgot-password [post]
func (h *Handler) ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid request body",
		})
		return
	}

	if err := h.svc.ForgotPassword(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "OTP sent to email successfully",
	})
}

// ─── ChangePassword ───────────────────────────────────────────────────────────────────
// @Summary      Change password
// @Tags         User
// @Accept       json
// @Produce      json
// @Param        request body ChangePasswordRequest true "Change password payload"
// @Success      200  {object}  map[string]any
// @Failure      400  {object}  map[string]any
// @Router       /users/change-password [post]
func (h *Handler) ChangePassword(c *gin.Context) {
	email := c.Param("email")	 // JS ka req.params.email

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "invalid request body",
		})
		return
	}

	if err := h.svc.ChangePassword(c.Request.Context(), email, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password changed successfully",
	})
}

// ─── GetProfile ───────────────────────────────────────────────────────────────

// @Summary      Get profile
// @Tags         User
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  UserResponse
// @Failure      401  {object}  map[string]any
// @Router       /users/profile [get]
func (h *Handler) GetProfile(c *gin.Context) {
	// middleware ne userID context mein daala hoga
	userIDStr, exists := c.Get("uid")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "unauthorized"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid user id"})
		return
	}

	user, err := h.svc.GetProfile(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user":    user,
	})
}

// ─── UpdateProfile ──────────────────────────────────────────────────────────

// @Summary      Update profile
// @Tags         User
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body UpdateUserRequest true "Update user payload"
// @Success      200  {object}  map[string]any
// @Failure      400  {object}  map[string]any
// @Failure      500  {object}  map[string]any
// @Router       /users/profile [put]
func (h *Handler) UpdateProfile(c *gin.Context) {
	userIDStr, _ := c.Get("uid")
	userID, _ := uuid.Parse(userIDStr.(string))

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request"})
		return
	}

	user, err := h.svc.UpdateProfile(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile updated",
		"user":    user,
	})
}

// ─── UpdateUser ─────────────────────────────────────────────────────────────────
// @Summary      Update user
// @Tags         User
// @Security     BearerAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        id path string true "User ID"
// @Param        request body UpdateUserRequest true "Update user payload"
// @Success      200  {object}  map[string]any
// @Failure      400  {object}  map[string]any
// @Failure      500  {object}  map[string]any
// @Router       /users/{id} [put]
func (h *Handler) UpdateUser(c *gin.Context) {
	// 1. route param — JS ka req.params.id
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid user id"})
		return
	}

	// 2. logged in user — auth middleware ne set kiya hoga
	loggedInID, _ := uuid.Parse(c.GetString("uid"))
	loggedInRole := c.GetString("role")

	// 3. multipart form data bind karo
	var req UpdateUserRequest
	req.FirstName = c.PostForm("firstName")
	req.LastName = c.PostForm("lastName")
	req.Address = c.PostForm("address")
	req.City = c.PostForm("city")
	req.ZipCode = c.PostForm("zipCode")
	req.PhoneNo = c.PostForm("phoneNo")
	req.Role = c.PostForm("role")

	// 4. file handle karo — JS ka req.file
	var fileBytes []byte
	file, err := c.FormFile("file")
	if err == nil { // file upload ki hai
		f, _ := file.Open()
		defer f.Close()
		fileBytes, _ = io.ReadAll(f)
	}

	user, err := h.svc.UpdateUser(c.Request.Context(), loggedInID, loggedInRole, targetID, &req, fileBytes)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "you are not allowed to update this profile" {
			status = http.StatusForbidden
		}
		if err.Error() == "user not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile updated successfully",
		"user":    user,
	})
}

// ─── VerifyOTP ────────────────────────────────────────────────────────────────
// @Summary      Verify OTP
// @Tags         User
// @Accept       json
// @Produce      json
// @Param        request body VerifyOTPRequest true "Verify OTP payload"
// @Success      200  {object}  map[string]any
// @Failure      400  {object}  map[string]any
// @Failure      500  {object}  map[string]any
// @Router       /users/verify-otp/{email} [post]
func (h *Handler) VerifyOTP(c *gin.Context) {
	email := c.Param("email")

	var req VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid request"})
		return
	}

	if email != "" {
		req.Email = email
	}

	if err := h.svc.VerifyOTP(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "OTP verified"})
}

// ─── GetAllUsers ────────────────────────────────────────────────────────────────
// @Summary      Get all users
// @Tags         User
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  map[string]any
// @Failure      500  {object}  map[string]any
// @Router       /users [get]
func (h *Handler) GetAllUsers(c *gin.Context) {
	users, err := h.svc.GetAllUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"users":   users,
	})
}

// @Summary      Get user by ID
// @Tags         User
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "User ID"
// @Success      200  {object}  map[string]any
// @Failure      400  {object}  map[string]any
// @Failure      500  {object}  map[string]any
// @Router       /users/{id} [get]
func (h *Handler) GetUserByID(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success":  false,
			"message":  "invalid user id",
			"error":    err.Error(),
			"received": c.Param("userId"),
		})
		return
	}

	user, err := h.svc.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user":    user,
	})
}
