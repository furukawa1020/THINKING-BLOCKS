package config

import "os"

type Config struct {
	DatabaseURL string
	RedisURL    string
	JWTSecret   string
	Port        string
	Environment string
}

func Load() *Config {
	return &Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgres://localhost/thinking_blocks?sslmode=disable"),
		RedisURL:    getEnv("REDIS_URL", "localhost:6379"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
