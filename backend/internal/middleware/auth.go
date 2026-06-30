package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go-ekart/internal/utils"
)

func Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.Request.Header.Get("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header provided"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header must be in 'Bearer <token>' format"})
			c.Abort()
			return
		}

		clientToken := parts[1]

		claims, err := utils.ValidateToken(clientToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		c.Set("email", claims.Email)
		c.Set("uid", claims.UID)
		c.Set("role", claims.Role)
		c.Next()
	}
}


func IsAdmin(c *gin.Context) {
    // auth middleware ne pehle role set kiya hoga context mein
    role, exists := c.Get("role")
    if !exists || role.(string) != "admin" {
        c.JSON(http.StatusForbidden, gin.H{
            "success": false,
            "message": "Access denied: Admins only",
        })
        c.Abort() // ⚠️ JS ka return next() — Go mein Abort() zaruri hai
        return
    }

    c.Next()
}
