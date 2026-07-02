package user

import (
	"go-ekart/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes — main.go ya central routes se call karo
func RegisterRoutes(r *gin.RouterGroup, h *Handler, authMiddleware gin.HandlerFunc) {
	userGroup := r.Group("/user")
	{
		// Public
		userGroup.POST("/register", h.Register)
		userGroup.POST("/login", h.Login)
		userGroup.POST("/refresh-token", h.RefreshToken)
		userGroup.POST("/verify-otp/:email", h.VerifyOTP)
		userGroup.POST("/forgot-password", h.ForgotPassword)
		userGroup.POST("/change-password/:email", h.ChangePassword)
		userGroup.GET("/get-user/:userId", h.GetUserByID)

		// Protected — auth middleware lagao
		protected := userGroup.Group("/", authMiddleware)
		{
			protected.POST("/logout", h.Logout)
			protected.GET("/profile", h.GetProfile)
			protected.PUT("/profile", h.UpdateProfile)
			protected.PUT("/update/:id", middleware.SingleUpload("file"), h.UpdateUser)

		}

		// Admin protected
		userGroup.GET("/all-user", authMiddleware, middleware.IsAdmin, h.GetAllUsers)

	}
}
