#!/bin/bash

# THINKING BLOCKS - 開発環境セットアップスクリプト

echo "🚀 THINKING BLOCKS - セットアップ開始"

# 色付き出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Goのバージョンチェック
echo -e "${YELLOW}📦 Goのバージョンを確認中...${NC}"
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Goがインストールされていません${NC}"
    echo "https://golang.org/dl/ からインストールしてください"
    exit 1
fi
echo -e "${GREEN}✅ Go $(go version)${NC}"

# 2. Node.jsのバージョンチェック
echo -e "${YELLOW}📦 Node.jsのバージョンを確認中...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.jsがインストールされていません${NC}"
    echo "https://nodejs.org/ からインストールしてください"
    exit 1
fi
echo -e "${GREEN}✅ Node $(node --version)${NC}"

# 3. Dockerのバージョンチェック
echo -e "${YELLOW}📦 Dockerのバージョンを確認中...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Dockerがインストールされていません${NC}"
    echo "https://www.docker.com/ からインストールしてください"
    exit 1
fi
echo -e "${GREEN}✅ Docker $(docker --version)${NC}"

# 4. Go依存関係のインストール
echo -e "${YELLOW}📦 Go依存関係をインストール中...${NC}"
cd backend
if [ ! -f "go.mod" ]; then
    echo -e "${RED}❌ go.modが見つかりません${NC}"
    exit 1
fi
go mod download
echo -e "${GREEN}✅ Go依存関係のインストール完了${NC}"
cd ..

# 5. Node.js依存関係のインストール
echo -e "${YELLOW}📦 Node.js依存関係をインストール中...${NC}"
npm install
echo -e "${GREEN}✅ Node.js依存関係のインストール完了${NC}"

# 6. 環境変数ファイルの作成
echo -e "${YELLOW}📝 環境変数ファイルを作成中...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .envファイルを作成しました${NC}"
else
    echo -e "${YELLOW}⚠️  .envファイルは既に存在します${NC}"
fi

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ backend/.envファイルを作成しました${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.envファイルは既に存在します${NC}"
fi

# 7. Dockerコンテナの起動
echo -e "${YELLOW}🐳 PostgreSQLとRedisを起動中...${NC}"
docker-compose up -d postgres redis
echo -e "${GREEN}✅ データベースが起動しました${NC}"

# 待機
echo -e "${YELLOW}⏳ データベースの準備を待っています...${NC}"
sleep 5

# 8. セットアップ完了
echo ""
echo -e "${GREEN}🎉 セットアップが完了しました！${NC}"
echo ""
echo "次のコマンドで開発サーバーを起動できます:"
echo ""
echo -e "${YELLOW}バックエンド (ポート 8080):${NC}"
echo "  cd backend && go run main.go"
echo ""
echo -e "${YELLOW}フロントエンド (ポート 3000):${NC}"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}または、Docker Composeで全体を起動:${NC}"
echo "  docker-compose up --build"
echo ""
echo -e "${GREEN}✨ 完成度の高いTHINKING BLOCKSをお楽しみください！${NC}"
