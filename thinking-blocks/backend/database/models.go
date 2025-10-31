package database

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Project モデル
type Project struct {
	ID            string         `gorm:"primaryKey" json:"id"`
	Title         string         `gorm:"not null" json:"title"`
	Description   string         `json:"description"`
	Content       []byte         `gorm:"type:jsonb" json:"content"`
	Theme         string         `gorm:"default:creative" json:"theme"`
	OwnerID       string         `json:"owner_id"`
	IsPublic      bool           `gorm:"default:false" json:"is_public"`
	Collaborators []string       `gorm:"type:jsonb" json:"collaborators"`
	Tags          []string       `gorm:"type:jsonb" json:"tags"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate - IDの自動生成
func (p *Project) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

// ShareLink モデル
type ShareLink struct {
	ID          string         `gorm:"primaryKey" json:"id"`
	ProjectID   string         `gorm:"not null;index" json:"project_id"`
	Token       string         `gorm:"uniqueIndex;not null" json:"token"`
	Permission  string         `gorm:"default:view" json:"permission"` // view, edit
	ExpiresAt   *time.Time     `json:"expires_at"`
	MaxUses     *int           `json:"max_uses"`
	CurrentUses int            `gorm:"default:0" json:"current_uses"`
	CreatedAt   time.Time      `json:"created_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (s *ShareLink) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	if s.Token == "" {
		s.Token = generateToken()
	}
	return nil
}

// User モデル
type User struct {
	ID        string         `gorm:"primaryKey" json:"id"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Name      string         `json:"name"`
	Avatar    string         `json:"avatar"`
	Password  string         `gorm:"not null" json:"-"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

// AnalyticsEvent モデル
type AnalyticsEvent struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	UserID    string    `gorm:"index" json:"user_id"`
	ProjectID string    `gorm:"index" json:"project_id"`
	EventType string    `gorm:"index;not null" json:"event_type"`
	Data      []byte    `gorm:"type:jsonb" json:"data"`
	CreatedAt time.Time `gorm:"index" json:"created_at"`
}

func (a *AnalyticsEvent) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	return nil
}

// ヘルパー関数
func generateToken() string {
	return uuid.New().String()
}
