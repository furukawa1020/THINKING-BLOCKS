package main

import (
	"log"
	"os"

	"thinking-blocks-backend/api"
	"thinking-blocks-backend/database"
	"thinking-blocks-backend/websocket"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 環境変数の読み込み
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// データベース接続
	db, err := database.Connect()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// データベースのマイグレーション
	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Redisクライアント初期化
	redisClient := database.NewRedisClient()

	// Ginルーターの設定
	router := gin.Default()

	// CORS設定
	router.Use(corsMiddleware())

	// WebSocketハブの初期化
	hub := websocket.NewHub()
	go hub.Run()

	// APIハンドラーの初期化
	apiHandler := api.NewHandler(db, redisClient)

	// ヘルスチェック
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "thinking-blocks-backend",
		})
	})

	// API Routes
	v1 := router.Group("/api/v1")
	{
		// プロジェクト管理
		projects := v1.Group("/projects")
		{
			projects.GET("", apiHandler.GetProjects)
			projects.POST("", apiHandler.CreateProject)
			projects.GET("/:id", apiHandler.GetProject)
			projects.PUT("/:id", apiHandler.UpdateProject)
			projects.DELETE("/:id", apiHandler.DeleteProject)

			// 共有機能
			projects.POST("/:id/share", apiHandler.CreateShareLink)
			projects.GET("/:id/share", apiHandler.GetShareLinks)
		}

		// 共有アクセス
		v1.GET("/share/:token", apiHandler.AccessSharedProject)

		// AI分析
		v1.POST("/ai/analyze", apiHandler.AnalyzeThinking)

		// アナリティクス
		analytics := v1.Group("/analytics")
		{
			analytics.POST("/events", apiHandler.TrackEvent)
			analytics.GET("/stats", apiHandler.GetAnalytics)
		}

		// ユーザー認証（将来の実装用）
		auth := v1.Group("/auth")
		{
			auth.POST("/register", apiHandler.Register)
			auth.POST("/login", apiHandler.Login)
			auth.POST("/logout", apiHandler.Logout)
			auth.GET("/me", apiHandler.GetCurrentUser)
		}
	}

	// WebSocket接続
	router.GET("/ws/:projectId", func(c *gin.Context) {
		projectId := c.Param("projectId")
		websocket.HandleWebSocket(hub, c.Writer, c.Request, projectId)
	})

	// サーバー起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
