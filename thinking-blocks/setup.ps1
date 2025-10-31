# THINKING BLOCKS - 開発環境セットアップスクリプト (PowerShell)

Write-Host "🚀 THINKING BLOCKS - セットアップ開始" -ForegroundColor Cyan

# 1. Goのバージョンチェック
Write-Host "📦 Goのバージョンを確認中..." -ForegroundColor Yellow
try {
    $goVersion = go version
    Write-Host "✅ $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Goがインストールされていません" -ForegroundColor Red
    Write-Host "https://golang.org/dl/ からインストールしてください"
    exit 1
}

# 2. Node.jsのバージョンチェック
Write-Host "📦 Node.jsのバージョンを確認中..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.jsがインストールされていません" -ForegroundColor Red
    Write-Host "https://nodejs.org/ からインストールしてください"
    exit 1
}

# 3. Dockerのバージョンチェック
Write-Host "📦 Dockerのバージョンを確認中..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Dockerがインストールされていません" -ForegroundColor Red
    Write-Host "https://www.docker.com/ からインストールしてください"
    exit 1
}

# 4. Go依存関係のインストール
Write-Host "📦 Go依存関係をインストール中..." -ForegroundColor Yellow
Push-Location backend
if (-not (Test-Path "go.mod")) {
    Write-Host "❌ go.modが見つかりません" -ForegroundColor Red
    Pop-Location
    exit 1
}
go mod download
Write-Host "✅ Go依存関係のインストール完了" -ForegroundColor Green
Pop-Location

# 5. Node.js依存関係のインストール
Write-Host "📦 Node.js依存関係をインストール中..." -ForegroundColor Yellow
npm install
Write-Host "✅ Node.js依存関係のインストール完了" -ForegroundColor Green

# 6. 環境変数ファイルの作成
Write-Host "📝 環境変数ファイルを作成中..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .envファイルを作成しました" -ForegroundColor Green
} else {
    Write-Host "⚠️  .envファイルは既に存在します" -ForegroundColor Yellow
}

if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ backend\.envファイルを作成しました" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend\.envファイルは既に存在します" -ForegroundColor Yellow
}

# 7. Dockerコンテナの起動
Write-Host "🐳 PostgreSQLとRedisを起動中..." -ForegroundColor Yellow
docker-compose up -d postgres redis
Write-Host "✅ データベースが起動しました" -ForegroundColor Green

# 待機
Write-Host "⏳ データベースの準備を待っています..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 8. セットアップ完了
Write-Host ""
Write-Host "🎉 セットアップが完了しました！" -ForegroundColor Green
Write-Host ""
Write-Host "次のコマンドで開発サーバーを起動できます:"
Write-Host ""
Write-Host "バックエンド (ポート 8080):" -ForegroundColor Yellow
Write-Host "  cd backend; go run main.go"
Write-Host ""
Write-Host "フロントエンド (ポート 3000):" -ForegroundColor Yellow
Write-Host "  npm run dev"
Write-Host ""
Write-Host "または、Docker Composeで全体を起動:" -ForegroundColor Yellow
Write-Host "  docker-compose up --build"
Write-Host ""
Write-Host "✨ 完成度の高いTHINKING BLOCKSをお楽しみください！" -ForegroundColor Green
