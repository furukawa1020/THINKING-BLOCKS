# THINKING BLOCKS - バックエンドAPI仕様

## アーキテクチャ

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Next.js UI    │────▶│   Go Backend    │────▶│  PostgreSQL  │
│   (Port 3000)   │     │   (Port 8080)   │     │  (Port 5432) │
└─────────────────┘     └─────────────────┘     └──────────────┘
         │                       │                       │
         │              ┌────────▼────────┐             │
         └──────────────│     Redis       │─────────────┘
                        │   (Port 6379)   │
                        └─────────────────┘
                                │
                        ┌───────▼────────┐
                        │   WebSocket    │
                        │  (Real-time)   │
                        └────────────────┘
```

## セットアップ

### 1. バックエンドのビルドと起動

```bash
# Goの依存関係をインストール
cd backend
go mod download

# データベースのセットアップ（Dockerを使用）
docker-compose up -d postgres redis

# バックエンドサーバーの起動
go run main.go
```

### 2. フロントエンドの起動

```bash
# プロジェクトルートディレクトリで
npm install
npm run dev
```

### 3. Docker Composeで全体を起動

```bash
# プロジェクトルートで
docker-compose up --build
```

## API エンドポイント

### プロジェクト管理

#### GET /api/v1/projects
プロジェクト一覧を取得

**クエリパラメータ:**
- `owner` (string): オーナーでフィルタ
- `public` (boolean): 公開プロジェクトのみ

**レスポンス:**
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_xxx",
      "title": "新しい思考",
      "description": "説明",
      "content": {...},
      "theme": "creative",
      "owner_id": "user_xxx",
      "is_public": true,
      "created_at": "2025-10-31T00:00:00Z",
      "updated_at": "2025-10-31T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### POST /api/v1/projects
新規プロジェクトを作成

**リクエストボディ:**
```json
{
  "title": "新しい思考",
  "description": "説明",
  "content": {...},
  "theme": "creative",
  "owner": "user_xxx",
  "is_public": true
}
```

#### GET /api/v1/projects/:id
特定のプロジェクトを取得

#### PUT /api/v1/projects/:id
プロジェクトを更新

#### DELETE /api/v1/projects/:id
プロジェクトを削除

### 共有機能

#### POST /api/v1/projects/:id/share
共有リンクを生成

**リクエストボディ:**
```json
{
  "permission": "view",
  "expires_at": "2025-11-30T00:00:00Z",
  "max_uses": 10
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": "share_xxx",
    "token": "token_xxx",
    "project_id": "proj_xxx",
    "permission": "view",
    "url": "http://localhost:3000/shared/token_xxx"
  }
}
```

#### GET /api/v1/share/:token
共有トークンでプロジェクトにアクセス

### AI分析

#### POST /api/v1/ai/analyze
思考構造を分析

**リクエストボディ:**
```json
{
  "content": {...},
  "theme": "research",
  "analysis_type": "comprehensive"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "stats": {...},
    "patterns": ["論理的展開パターン検出"],
    "suggestions": ["さらに掘り下げてみましょう"],
    "timestamp": "2025-10-31T00:00:00Z"
  }
}
```

### アナリティクス

#### POST /api/v1/analytics/events
イベントを記録

#### GET /api/v1/analytics/stats
統計データを取得

### WebSocket

#### WS /ws/:projectId
リアルタイム共同編集

**メッセージフォーマット:**
```json
{
  "type": "update",
  "user_id": "user_xxx",
  "data": {...},
  "timestamp": 1698710400
}
```

**メッセージタイプ:**
- `join`: ユーザーが参加
- `leave`: ユーザーが退出
- `update`: ワークスペース更新
- `cursor`: カーソル位置更新

## データベーススキーマ

### projects テーブル
```sql
CREATE TABLE projects (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  theme VARCHAR DEFAULT 'creative',
  owner_id VARCHAR,
  is_public BOOLEAN DEFAULT false,
  collaborators JSONB,
  tags JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### share_links テーブル
```sql
CREATE TABLE share_links (
  id VARCHAR PRIMARY KEY,
  project_id VARCHAR NOT NULL,
  token VARCHAR UNIQUE NOT NULL,
  permission VARCHAR DEFAULT 'view',
  expires_at TIMESTAMP,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### users テーブル
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  avatar VARCHAR,
  password VARCHAR NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### analytics_events テーブル
```sql
CREATE TABLE analytics_events (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR,
  project_id VARCHAR,
  event_type VARCHAR NOT NULL,
  data JSONB,
  created_at TIMESTAMP
);
```

## 環境変数

```bash
# データベース
DATABASE_URL=postgres://postgres:postgres@localhost:5432/thinking_blocks?sslmode=disable

# Redis
REDIS_URL=localhost:6379

# サーバー
PORT=8080
ENVIRONMENT=development

# セキュリティ
JWT_SECRET=your-secret-key-change-in-production

# フロントエンド
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## 開発コマンド

```bash
# バックエンド開発サーバー起動
cd backend && go run main.go

# フロントエンド開発サーバー起動
npm run dev

# Docker Compose起動
docker-compose up

# データベースマイグレーション
cd backend && go run main.go

# テスト実行
cd backend && go test ./...
```

## デプロイ

### Heroku
```bash
heroku create thinking-blocks-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
git push heroku main
```

### Railway
```bash
railway init
railway add postgresql redis
railway up
```

### Google Cloud Run
```bash
gcloud run deploy thinking-blocks --source .
```
