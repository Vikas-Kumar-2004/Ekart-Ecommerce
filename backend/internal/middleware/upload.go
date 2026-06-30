package middleware

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// JS ka multer.memoryStorage() — Gin memory mein hi rakhta hai by default

// SingleUpload — multer({ storage }).single(fieldName)
func SingleUpload(fieldName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		_, err := c.FormFile(fieldName)
		if err != nil && err != http.ErrMissingFile {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "invalid file upload",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// MultipleUpload — multer({ storage }).array("files", 5)
func MultipleUpload(maxFiles int) gin.HandlerFunc {
	return func(c *gin.Context) {
		form, err := c.MultipartForm()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "invalid multipart form",
			})
			c.Abort()
			return
		}

		files := form.File["files"]
		if len(files) > maxFiles {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": fmt.Sprintf("max %d files allowed", maxFiles),
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
