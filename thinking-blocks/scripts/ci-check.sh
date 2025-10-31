#!/bin/bash

# CI/CD Troubleshooting Script
# このスクリプトはCI/CDパイプラインのローカルテストとデバッグに使用します

set -e

echo "🔍 Thinking Blocks CI/CD Troubleshooting"
echo "======================================="
echo ""

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 関数定義
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "ℹ $1"
}

# 1. 環境チェック
echo "1️⃣  環境チェック"
echo "-------------------"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js: $NODE_VERSION"
else
    print_error "Node.js がインストールされていません"
    exit 1
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm: $NPM_VERSION"
else
    print_error "npm がインストールされていません"
    exit 1
fi

if command -v go &> /dev/null; then
    GO_VERSION=$(go version)
    print_success "Go: $GO_VERSION"
else
    print_warning "Go がインストールされていません（バックエンドテストに必要）"
fi

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker: $DOCKER_VERSION"
else
    print_warning "Docker がインストールされていません（コンテナビルドに必要）"
fi

echo ""

# 2. フロントエンドチェック
echo "2️⃣  フロントエンドチェック"
echo "-------------------------"

print_info "依存関係のインストール..."
if npm ci &> /dev/null; then
    print_success "依存関係インストール成功"
else
    print_error "依存関係のインストールに失敗しました"
    exit 1
fi

print_info "Lintチェック..."
if npm run lint &> /dev/null; then
    print_success "Lint: パス"
else
    print_warning "Lint: 警告またはエラーがあります"
    npm run lint 2>&1 | tail -n 20
fi

print_info "型チェック..."
if npm run type-check &> /dev/null; then
    print_success "TypeScript: パス"
else
    print_error "型エラーがあります"
    npm run type-check 2>&1 | tail -n 20
    exit 1
fi

print_info "ビルド..."
if npm run build &> /dev/null; then
    print_success "ビルド: 成功"
else
    print_error "ビルドに失敗しました"
    npm run build 2>&1 | tail -n 30
    exit 1
fi

echo ""

# 3. バックエンドチェック（Goがある場合）
if command -v go &> /dev/null; then
    echo "3️⃣  バックエンドチェック"
    echo "-----------------------"
    
    cd backend
    
    print_info "Go モジュールのダウンロード..."
    if go mod download &> /dev/null; then
        print_success "Go モジュール: ダウンロード完了"
    else
        print_error "Go モジュールのダウンロードに失敗しました"
        cd ..
        exit 1
    fi
    
    print_info "テスト実行..."
    if go test -v ./... &> test_output.log; then
        print_success "テスト: パス"
        rm -f test_output.log
    else
        print_error "テストに失敗しました"
        tail -n 30 test_output.log
        rm -f test_output.log
        cd ..
        exit 1
    fi
    
    print_info "ビルド..."
    if go build -v -o thinking-blocks-backend &> /dev/null; then
        print_success "ビルド: 成功"
        rm -f thinking-blocks-backend
    else
        print_error "ビルドに失敗しました"
        cd ..
        exit 1
    fi
    
    cd ..
    echo ""
fi

# 4. Dockerビルドチェック（Dockerがある場合）
if command -v docker &> /dev/null; then
    echo "4️⃣  Dockerビルドチェック"
    echo "------------------------"
    
    print_info "フロントエンドイメージのビルド..."
    if docker build -t thinking-blocks-frontend:test . &> /dev/null; then
        print_success "フロントエンドイメージ: ビルド成功"
        docker rmi thinking-blocks-frontend:test &> /dev/null
    else
        print_error "フロントエンドイメージのビルドに失敗しました"
        exit 1
    fi
    
    if [ -d "backend" ]; then
        print_info "バックエンドイメージのビルド..."
        if docker build -t thinking-blocks-backend:test ./backend &> /dev/null; then
            print_success "バックエンドイメージ: ビルド成功"
            docker rmi thinking-blocks-backend:test &> /dev/null
        else
            print_error "バックエンドイメージのビルドに失敗しました"
            exit 1
        fi
    fi
    
    echo ""
fi

# 5. まとめ
echo "✅ すべてのチェックが完了しました"
echo ""
echo "次のステップ:"
echo "1. git add -A"
echo "2. git commit -m 'あなたのコミットメッセージ'"
echo "3. git push"
echo ""
echo "GitHub Actions で CI/CD パイプラインが自動実行されます"
echo "https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
