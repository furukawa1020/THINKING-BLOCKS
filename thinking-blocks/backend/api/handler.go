package api

import (
	"encoding/json"
	"net/http"
	"time"

	"thinking-blocks-backend/database"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type Handler struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewHandler(db *gorm.DB, redisClient *redis.Client) *Handler {
	return &Handler{
		db:    db,
		redis: redisClient,
	}
}

// GetProjects - プロジェクト一覧取得
func (h *Handler) GetProjects(c *gin.Context) {
	owner := c.Query("owner")
	isPublic := c.Query("public")

	var projects []database.Project
	query := h.db.Model(&database.Project{})

	if owner != "" {
		query = query.Where("owner_id = ?", owner)
	}
	if isPublic == "true" {
		query = query.Where("is_public = ?", true)
	}

	if err := query.Order("updated_at DESC").Find(&projects).Error; err != nil {
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
	})
}

// GetProject - 特定プロジェクト取得
func (h *Handler) GetProject(c *gin.Context) {
	id := c.Param("id")

	var project database.Project
	if err := h.db.First(&project, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Project not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    project,
	})
}

// CreateProject - プロジェクト作成
func (h *Handler) CreateProject(c *gin.Context) {
	var input struct {
		Title         string   `json:"title" binding:"required"`
		Description   string   `json:"description"`
		Content       json.RawMessage `json:"content" binding:"required"`
		Theme         string   `json:"theme"`
		Owner         string   `json:"owner"`
		IsPublic      bool     `json:"is_public"`
		Collaborators []string `json:"collaborators"`
		Tags          []string `json:"tags"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	project := database.Project{
		Title:         input.Title,
		Description:   input.Description,
		Content:       []byte(input.Content),
		Theme:         input.Theme,
		OwnerID:       input.Owner,
		IsPublic:      input.IsPublic,
		Collaborators: input.Collaborators,
		Tags:          input.Tags,
	}

	if err := h.db.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create project",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    project,
	})
}

// UpdateProject - プロジェクト更新
func (h *Handler) UpdateProject(c *gin.Context) {
	id := c.Param("id")

	var project database.Project
	if err := h.db.First(&project, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Project not found",
		})
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	if err := h.db.Model(&project).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update project",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    project,
	})
}

// DeleteProject - プロジェクト削除
func (h *Handler) DeleteProject(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&database.Project{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to delete project",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Project deleted successfully",
	})
}

// CreateShareLink - 共有リンク作成
func (h *Handler) CreateShareLink(c *gin.Context) {
	projectID := c.Param("id")

	var input struct {
		Permission string     `json:"permission"`
		ExpiresAt  *time.Time `json:"expires_at"`
		MaxUses    *int       `json:"max_uses"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	shareLink := database.ShareLink{
		ProjectID:  projectID,
		Permission: input.Permission,
		ExpiresAt:  input.ExpiresAt,
		MaxUses:    input.MaxUses,
	}

	if err := h.db.Create(&shareLink).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create share link",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    shareLink,
	})
}

// GetShareLinks - 共有リンク一覧
func (h *Handler) GetShareLinks(c *gin.Context) {
	projectID := c.Param("id")

	var shareLinks []database.ShareLink
	if err := h.db.Where("project_id = ?", projectID).Find(&shareLinks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch share links",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    shareLinks,
	})
}

// AccessSharedProject - 共有プロジェクトアクセス
func (h *Handler) AccessSharedProject(c *gin.Context) {
	token := c.Param("token")

	var shareLink database.ShareLink
	if err := h.db.Where("token = ?", token).First(&shareLink).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Invalid or expired share link",
		})
		return
	}

	// 有効期限チェック
	if shareLink.ExpiresAt != nil && shareLink.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"error":   "Share link has expired",
		})
		return
	}

	// 使用回数チェック
	if shareLink.MaxUses != nil && shareLink.CurrentUses >= *shareLink.MaxUses {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"error":   "Share link usage limit reached",
		})
		return
	}

	// 使用回数をインクリメント
	h.db.Model(&shareLink).Update("current_uses", shareLink.CurrentUses+1)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"project_id": shareLink.ProjectID,
			"permission": shareLink.Permission,
		},
	})
}

// AnalyzeThinking - AI分析
func (h *Handler) AnalyzeThinking(c *gin.Context) {
	var input struct {
		Content      json.RawMessage `json:"content" binding:"required"`
		Theme        string          `json:"theme"`
		AnalysisType string          `json:"analysis_type"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// TODO: 実際のAI分析ロジックを実装
	analysis := gin.H{
		"stats": gin.H{
			"total": 0,
		},
		"patterns":    []string{},
		"suggestions": []string{"思考をさらに深掘りしてみましょう"},
		"timestamp":   time.Now(),
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    analysis,
	})
}

// TrackEvent - イベント追跡
func (h *Handler) TrackEvent(c *gin.Context) {
	var input struct {
		UserID    string          `json:"user_id"`
		ProjectID string          `json:"project_id"`
		EventType string          `json:"event_type" binding:"required"`
		Data      json.RawMessage `json:"data"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	event := database.AnalyticsEvent{
		UserID:    input.UserID,
		ProjectID: input.ProjectID,
		EventType: input.EventType,
		Data:      []byte(input.Data),
	}

	if err := h.db.Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to track event",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    event,
	})
}

// GetAnalytics - 分析データ取得
func (h *Handler) GetAnalytics(c *gin.Context) {
	// TODO: 実装
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"totalEvents": 0,
			"stats":       gin.H{},
		},
	})
}

// 認証関連（スタブ実装）
func (h *Handler) Register(c *gin.Context)        { c.JSON(200, gin.H{"message": "Not implemented"}) }
func (h *Handler) Login(c *gin.Context)           { c.JSON(200, gin.H{"message": "Not implemented"}) }
func (h *Handler) Logout(c *gin.Context)          { c.JSON(200, gin.H{"message": "Not implemented"}) }
func (h *Handler) GetCurrentUser(c *gin.Context)  { c.JSON(200, gin.H{"message": "Not implemented"}) }
