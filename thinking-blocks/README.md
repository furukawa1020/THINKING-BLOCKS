# 🧠 THINKING BLOCKS

**人間の思考を可視化する革新的なビジュアルプログラミング環境**

思考のプロセスをブロックで構造化し、深い洞察と新しい発見をもたらします。

## ✨ 特徴

### 🎨 フロントエンド (Next.js 16 + React 19)
- **6種類の思考ブロック**: WHY, HOW, WHAT, OBSERVE, REFLECT, CONNECT
- **4つのテーマ**: Creative, Introspection, Research, Education
- **3つの出力形式**: テキスト構文、JSON、マインドマップ
- **AI思考分析**: パターン検出と改善提案
- **多様なエクスポート**: Markdown, JSON, SVG, PNG
- **キーボードショートカット**: Ctrl+S (保存), Ctrl+O (開く), Ctrl+E (エクスポート)

### ⚡ バックエンド (Go 1.21)
- **RESTful API**: Gin Webフレームワーク
- **リアルタイム共同編集**: Gorilla WebSocket
- **データ永続化**: PostgreSQL + Redis
- **認証・認可**: JWT認証
- **アナリティクス**: 思考パターン分析と統計

### 🐳 インフラ
- **Docker Compose**: フルスタック環境を一発起動
- **マイクロサービス**: フロントエンド、バックエンド、DB、キャッシュ
- **スケーラブル**: 水平スケーリング対応

## 🚀 クイックスタート

### 方法1: Docker Compose（推奨）

```bash
# リポジトリをクローン
git clone https://github.com/furukawa1020/THINKING-BLOCKproto.git
cd THINKING-BLOCKproto

# 全サービスを起動
docker-compose up --build

# ブラウザで開く
# フロントエンド: http://localhost:3000
# バックエンドAPI: http://localhost:8080
```

### 方法2: ローカル開発

#### 前提条件
- Node.js 20+
- Go 1.21+
- PostgreSQL 16+
- Redis 7+
- Docker (推奨)

#### セットアップスクリプト実行

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

#### 手動セットアップ

```bash
# 1. データベース起動
docker-compose up -d postgres redis

# 2. バックエンド起動
cd backend
cp .env.example .env
go mod download
go run main.go  # ポート 8080

# 3. フロントエンド起動（別ターミナル）
cd ..
npm install
npm run dev  # ポート 3000
```

## 📁 プロジェクト構造

```
thinking-blocks/
├── src/                      # Next.jsフロントエンド
│   ├── app/                  # App Router
│   │   ├── api/             # Next.js API Routes (開発用)
│   │   ├── layout.tsx       # ルートレイアウト
│   │   └── page.tsx         # メインページ
│   ├── components/          # Reactコンポーネント
│   │   ├── ThinkingBlocksApp.tsx    # メインアプリ
│   │   ├── BlocklyEditor.tsx        # Blocklyエディタ
│   │   ├── OutputViewer.tsx         # 出力ビューア
│   │   ├── MindMapCanvas.tsx        # マインドマップ
│   │   ├── AIReflection.tsx         # AI分析
│   │   └── ExportService.tsx        # エクスポート
│   ├── hooks/               # カスタムフック
│   │   └── useCollaboration.ts      # リアルタイム共同編集
│   └── lib/                 # ユーティリティ
│       ├── api-client.ts    # APIクライアント
│       └── db.ts            # データベースクライアント
│
├── backend/                 # Goバックエンド
│   ├── main.go             # エントリーポイント
│   ├── config/             # 設定
│   ├── database/           # データベース層
│   │   ├── database.go
│   │   └── models.go
│   ├── api/                # APIハンドラー
│   │   └── handler.go
│   ├── websocket/          # WebSocket
│   │   ├── hub.go
│   │   └── client.go
│   ├── go.mod              # Go依存関係
│   ├── Dockerfile          # Goコンテナ
│   └── .env.example        # 環境変数サンプル
│
├── docker-compose.yml      # Docker設定
├── Dockerfile              # Next.jsコンテナ
├── setup.sh                # Linuxセットアップ
├── setup.ps1               # Windowsセットアップ
├── BACKEND.md              # バックエンドAPI仕様
└── README.md               # このファイル
```

## 🎯 使い方

### 1. ブロックで思考を構築
- **WHY**: なぜ？根本原因を探る
- **HOW**: どうやって？方法・プロセス
- **WHAT**: 何を？具体的な内容
- **OBSERVE**: 観察事実を記録
- **REFLECT**: 振り返りと学び
- **CONNECT**: アイデアを結びつける

### 2. テーマを選択
- **Creative**: 創造的思考
- **Introspection**: 内省・自己分析
- **Research**: 研究・調査
- **Education**: 学習・教育

### 3. 出力形式を確認
- **テキスト**: シンプルな構文表示
- **JSON**: データ構造として保存
- **マインドマップ**: ビジュアル表示

### 4. エクスポート
- Markdown, JSON, SVG, PNG形式で保存
- 共有リンク生成
- リアルタイム共同編集

## 🔧 API仕様

詳細は [BACKEND.md](./BACKEND.md) を参照

### 主要エンドポイント

```
GET    /api/v1/projects          - プロジェクト一覧
POST   /api/v1/projects          - プロジェクト作成
GET    /api/v1/projects/:id      - プロジェクト取得
PUT    /api/v1/projects/:id      - プロジェクト更新
DELETE /api/v1/projects/:id      - プロジェクト削除

POST   /api/v1/projects/:id/share - 共有リンク生成
GET    /api/v1/share/:token       - 共有アクセス

POST   /api/v1/ai/analyze         - AI思考分析

WS     /ws/:projectId             - リアルタイム共同編集
```

## 🌐 デプロイ

### Vercel (フロントエンド)
```bash
vercel deploy
```

### Railway/Heroku (バックエンド)
```bash
# Railway
railway init
railway up

# Heroku
heroku create
heroku addons:create heroku-postgresql
heroku addons:create heroku-redis
git push heroku main
```

### Docker
```bash
docker-compose up -d --build
```

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **フロントエンド** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **バックエンド** | Go 1.21, Gin, GORM, Gorilla WebSocket |
| **データベース** | PostgreSQL 16, Redis 7 |
| **インフラ** | Docker, Docker Compose |
| **ビジュアル** | Google Blockly, Canvas API |
| **アイコン** | Lucide React |
| **フォント** | Quicksand (Google Fonts) |

## 📊 パフォーマンス

- **初回ロード**: < 2秒
- **リアルタイム同期**: < 100ms
- **同時接続**: 1000+ユーザー対応
- **データベース**: インデックス最適化済み

詳細は [PERFORMANCE.md](.github/PERFORMANCE.md) を参照してください。

## 🔄 CI/CD

### GitHub Actions パイプライン

[![CI/CD Pipeline](https://github.com/furukawa1020/THINKING-BLOCKproto/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/furukawa1020/THINKING-BLOCKproto/actions/workflows/ci-cd.yml)

- ✅ **自動テスト**: フロントエンド・バックエンド両方
- 🐳 **Dockerビルド**: マルチステージビルド最適化
- 🔒 **セキュリティスキャン**: Trivyによる脆弱性検出
- 📦 **アーティファクト管理**: ビルド成果物の保存
- 🚀 **自動デプロイ**: mainブランチへのプッシュで自動実行（オプション）

### ローカルでCI/CDチェック

**Windows:**
```powershell
.\scripts\ci-check.ps1
```

**macOS/Linux:**
```bash
chmod +x scripts/ci-check.sh
./scripts/ci-check.sh
```

詳細は [CI/CD設定ガイド](.github/CICD.md) を参照してください。

## 🤝 コントリビューション

プルリクエスト大歓迎！

1. フォーク
2. フィーチャーブランチ作成 (`git checkout -b feature/amazing`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing`)
5. プルリクエスト作成

## 📝 ライセンス

MIT License

## 🎓 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Go Documentation](https://golang.org/doc/)
- [Blockly Documentation](https://developers.google.com/blockly)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 👥 作者

Created with ❤️ by furukawa1020

---

**🌟 思考の可視化で、新しい発見を！**
