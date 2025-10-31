package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// RateLimiter - レート制限ミドルウェア
func RateLimiter(requestsPerSecond int) gin.HandlerFunc {
	limiter := rate.NewLimiter(rate.Limit(requestsPerSecond), requestsPerSecond*2)

	return func(c *gin.Context) {
		if !limiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   "Rate limit exceeded",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// Timeout - タイムアウトミドルウェア
func Timeout(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		timeoutCtx, cancel := time.WithTimeout(ctx, timeout)
		defer cancel()

		c.Request = c.Request.WithContext(timeoutCtx)
		c.Next()
	}
}

// Cache - シンプルなキャッシュミドルウェア
func Cache(duration time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Cache-Control", "public, max-age="+string(rune(duration.Seconds())))
		c.Next()
	}
}
