package api

import (
	"net/http"
	"runtime"

	"github.com/gin-gonic/gin"
)

// HealthCheck - ヘルスチェックエンドポイント
func (h *Handler) HealthCheck(c *gin.Context) {
	// データベース接続チェック
	sqlDB, err := h.db.DB()
	dbHealthy := err == nil
	if dbHealthy {
		err = sqlDB.Ping()
		dbHealthy = err == nil
	}

	// Redis接続チェック
	redisHealthy := true
	if h.redis != nil {
		err = h.redis.Ping(c.Request.Context()).Err()
		redisHealthy = err == nil
	}

	// 全体のヘルス状態
	healthy := dbHealthy && redisHealthy
	statusCode := http.StatusOK
	if !healthy {
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, gin.H{
		"status":   getHealthStatus(healthy),
		"database": getHealthStatus(dbHealthy),
		"redis":    getHealthStatus(redisHealthy),
		"timestamp": "2025-10-31T00:00:00Z",
	})
}

// MetricsEndpoint - メトリクスエンドポイント
func (h *Handler) MetricsEndpoint(c *gin.Context) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	c.JSON(http.StatusOK, gin.H{
		"memory": gin.H{
			"alloc":       m.Alloc / 1024 / 1024,       // MB
			"total_alloc": m.TotalAlloc / 1024 / 1024,  // MB
			"sys":         m.Sys / 1024 / 1024,         // MB
			"num_gc":      m.NumGC,
		},
		"goroutines": runtime.NumGoroutine(),
		"cpu_count":  runtime.NumCPU(),
	})
}

// ReadinessCheck - Readinessプローブ
func (h *Handler) ReadinessCheck(c *gin.Context) {
	sqlDB, err := h.db.DB()
	if err != nil || sqlDB.Ping() != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "not ready",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ready",
	})
}

// LivenessCheck - Livenessプローブ
func (h *Handler) LivenessCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "alive",
	})
}

func getHealthStatus(healthy bool) string {
	if healthy {
		return "healthy"
	}
	return "unhealthy"
}
