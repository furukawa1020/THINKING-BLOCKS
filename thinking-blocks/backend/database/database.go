package database

import (
	"context"
	"log"
	"os"

	"github.com/go-redis/redis/v8"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// データベース接続
func Connect() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=thinking_blocks port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return nil, err
	}

	log.Println("Database connected successfully")
	return db, nil
}

// データベースマイグレーション
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&Project{},
		&ShareLink{},
		&User{},
		&AnalyticsEvent{},
	)
}

// Redisクライアント
func NewRedisClient() *redis.Client {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr:     redisURL,
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       0,
	})

	// 接続テスト
	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("Redis connection failed: %v (continuing without cache)", err)
		return nil
	}

	log.Println("Redis connected successfully")
	return client
}
