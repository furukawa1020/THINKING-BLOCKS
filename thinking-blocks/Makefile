# THINKING BLOCKS - Makefile

.PHONY: help install build test run clean docker-up docker-down migrate

# デフォルトターゲット
help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make build        - Build frontend and backend"
	@echo "  make test         - Run all tests"
	@echo "  make run          - Run development servers"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make docker-up    - Start Docker containers"
	@echo "  make docker-down  - Stop Docker containers"
	@echo "  make migrate      - Run database migrations"

# 依存関係のインストール
install:
	@echo "Installing frontend dependencies..."
	npm install
	@echo "Installing backend dependencies..."
	cd backend && go mod download
	@echo "✅ Dependencies installed"

# ビルド
build: build-frontend build-backend

build-frontend:
	@echo "Building frontend..."
	npm run build
	@echo "✅ Frontend built"

build-backend:
	@echo "Building backend..."
	cd backend && go build -o ../bin/thinking-blocks-backend
	@echo "✅ Backend built"

# テスト
test: test-frontend test-backend

test-frontend:
	@echo "Running frontend tests..."
	npm run test
	@echo "✅ Frontend tests passed"

test-backend:
	@echo "Running backend tests..."
	cd backend && go test -v -race -coverprofile=coverage.out ./...
	@echo "✅ Backend tests passed"

# カバレッジレポート
coverage:
	cd backend && go tool cover -html=coverage.out

# 開発サーバー起動
run:
	@echo "Starting development servers..."
	@echo "Frontend will be available at http://localhost:3000"
	@echo "Backend will be available at http://localhost:8080"
	@echo ""
	@echo "Press Ctrl+C to stop"
	@make -j2 run-frontend run-backend

run-frontend:
	npm run dev

run-backend:
	cd backend && go run main.go

# クリーンアップ
clean:
	@echo "Cleaning build artifacts..."
	rm -rf .next
	rm -rf bin
	rm -rf backend/coverage.out
	@echo "✅ Cleaned"

# Docker
docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "✅ Containers started"

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down
	@echo "✅ Containers stopped"

docker-build:
	@echo "Building Docker images..."
	docker-compose build
	@echo "✅ Images built"

# データベースマイグレーション
migrate:
	@echo "Running database migrations..."
	cd backend && go run main.go migrate
	@echo "✅ Migrations completed"

# リンター
lint: lint-frontend lint-backend

lint-frontend:
	@echo "Running frontend linter..."
	npm run lint
	@echo "✅ Frontend linted"

lint-backend:
	@echo "Running backend linter..."
	cd backend && golangci-lint run
	@echo "✅ Backend linted"

# フォーマット
format: format-frontend format-backend

format-frontend:
	@echo "Formatting frontend code..."
	npm run format
	@echo "✅ Frontend formatted"

format-backend:
	@echo "Formatting backend code..."
	cd backend && go fmt ./...
	@echo "✅ Backend formatted"

# 本番ビルド
production: clean install build
	@echo "✅ Production build complete"
