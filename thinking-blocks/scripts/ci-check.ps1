# CI/CD Troubleshooting Script for Windows PowerShell
# このスクリプトはCI/CDパイプラインのローカルテストとデバッグに使用します

$ErrorActionPreference = "Stop"

Write-Host "🔍 Thinking Blocks CI/CD Troubleshooting" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# 関数定義
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Failure {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor White
}

# 1. 環境チェック
Write-Host "1️⃣  環境チェック" -ForegroundColor Yellow
Write-Host "-------------------"

try {
    $nodeVersion = node --version
    Write-Success "Node.js: $nodeVersion"
} catch {
    Write-Failure "Node.js がインストールされていません"
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Success "npm: $npmVersion"
} catch {
    Write-Failure "npm がインストールされていません"
    exit 1
}

try {
    $goVersion = go version
    Write-Success "Go: $goVersion"
    $goInstalled = $true
} catch {
    Write-Warning "Go がインストールされていません（バックエンドテストに必要）"
    $goInstalled = $false
}

try {
    $dockerVersion = docker --version
    Write-Success "Docker: $dockerVersion"
    $dockerInstalled = $true
} catch {
    Write-Warning "Docker がインストールされていません（コンテナビルドに必要）"
    $dockerInstalled = $false
}

Write-Host ""

# 2. フロントエンドチェック
Write-Host "2️⃣  フロントエンドチェック" -ForegroundColor Yellow
Write-Host "-------------------------"

Write-Info "依存関係のインストール..."
try {
    npm ci 2>&1 | Out-Null
    Write-Success "依存関係インストール成功"
} catch {
    Write-Failure "依存関係のインストールに失敗しました"
    exit 1
}

Write-Info "Lintチェック..."
try {
    npm run lint 2>&1 | Out-Null
    Write-Success "Lint: パス"
} catch {
    Write-Warning "Lint: 警告またはエラーがあります"
    npm run lint
}

Write-Info "型チェック..."
try {
    npm run type-check 2>&1 | Out-Null
    Write-Success "TypeScript: パス"
} catch {
    Write-Failure "型エラーがあります"
    npm run type-check
    exit 1
}

Write-Info "ビルド..."
try {
    npm run build 2>&1 | Out-Null
    Write-Success "ビルド: 成功"
} catch {
    Write-Failure "ビルドに失敗しました"
    npm run build
    exit 1
}

Write-Host ""

# 3. バックエンドチェック（Goがある場合）
if ($goInstalled) {
    Write-Host "3️⃣  バックエンドチェック" -ForegroundColor Yellow
    Write-Host "-----------------------"
    
    Push-Location backend
    
    Write-Info "Go モジュールのダウンロード..."
    try {
        go mod download 2>&1 | Out-Null
        Write-Success "Go モジュール: ダウンロード完了"
    } catch {
        Write-Failure "Go モジュールのダウンロードに失敗しました"
        Pop-Location
        exit 1
    }
    
    Write-Info "テスト実行..."
    try {
        go test -v ./... 2>&1 | Out-Null
        Write-Success "テスト: パス"
    } catch {
        Write-Failure "テストに失敗しました"
        go test -v ./...
        Pop-Location
        exit 1
    }
    
    Write-Info "ビルド..."
    try {
        go build -v -o thinking-blocks-backend.exe 2>&1 | Out-Null
        Write-Success "ビルド: 成功"
        Remove-Item thinking-blocks-backend.exe -ErrorAction SilentlyContinue
    } catch {
        Write-Failure "ビルドに失敗しました"
        Pop-Location
        exit 1
    }
    
    Pop-Location
    Write-Host ""
}

# 4. Dockerビルドチェック（Dockerがある場合）
if ($dockerInstalled) {
    Write-Host "4️⃣  Dockerビルドチェック" -ForegroundColor Yellow
    Write-Host "------------------------"
    
    Write-Info "フロントエンドイメージのビルド..."
    try {
        docker build -t thinking-blocks-frontend:test . 2>&1 | Out-Null
        Write-Success "フロントエンドイメージ: ビルド成功"
        docker rmi thinking-blocks-frontend:test 2>&1 | Out-Null
    } catch {
        Write-Failure "フロントエンドイメージのビルドに失敗しました"
        exit 1
    }
    
    if (Test-Path "backend") {
        Write-Info "バックエンドイメージのビルド..."
        try {
            docker build -t thinking-blocks-backend:test ./backend 2>&1 | Out-Null
            Write-Success "バックエンドイメージ: ビルド成功"
            docker rmi thinking-blocks-backend:test 2>&1 | Out-Null
        } catch {
            Write-Failure "バックエンドイメージのビルドに失敗しました"
            exit 1
        }
    }
    
    Write-Host ""
}

# 5. まとめ
Write-Host "✅ すべてのチェックが完了しました" -ForegroundColor Green
Write-Host ""
Write-Host "次のステップ:"
Write-Host "1. git add -A"
Write-Host "2. git commit -m 'あなたのコミットメッセージ'"
Write-Host "3. git push"
Write-Host ""
Write-Host "GitHub Actions で CI/CD パイプラインが自動実行されます"
Write-Host "https://github.com/furukawa1020/THINKING-BLOCKproto/actions"

