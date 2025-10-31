package api

import (
	"net/http"
	"strconv"
	"time"

	"thinking-blocks-backend/cache"
	"thinking-blocks-backend/database"

	"github.com/gin-gonic/gin"
)

// GetProjectsWithCache - キャッシュを使用したプロジェクト一覧取得
func (h *Handler) GetProjectsWithCache(c *gin.Context) {
	owner := c.Query("owner")
	isPublic := c.Query("public")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	// キャッシュキーの生成
	cacheKey := "projects:" + owner + ":" + isPublic + ":" + strconv.Itoa(page)

	// キャッシュから取得試行
	var projects []database.Project
	cacheManager := cache.NewCache(h.redis)

	err := cacheManager.GetOrSet(
		cacheKey,
		&projects,
		5*time.Minute,
		func() (interface{}, error) {
			var result []database.Project
			query := h.db.Model(&database.Project{})

			if owner != "" {
				query = query.Where("owner_id = ?", owner)
			}
			if isPublic == "true" {
				query = query.Where("is_public = ?", true)
			}

			offset := (page - 1) * pageSize
			if err := query.Order("updated_at DESC").
				Offset(offset).
				Limit(pageSize).
				Find(&result).Error; err != nil {
				return nil, err
			}

			return result, nil
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch projects",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    projects,
		"count":   len(projects),
		"page":    page,
		"cached":  true,
	})
}

// InvalidateProjectCache - プロジェクトキャッシュの無効化
func (h *Handler) InvalidateProjectCache(projectID string) {
	if h.redis == nil {
		return
	}

	cacheManager := cache.NewCache(h.redis)
	// プロジェクト関連のキャッシュを削除
	cacheManager.DeletePattern("projects:*")
	cacheManager.Delete("project:" + projectID)
}
