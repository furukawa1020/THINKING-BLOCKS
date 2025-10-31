# CI/CD Troubleshooting Script for Windows PowerShell
# このスクリプトはCI/CDパイプラインのローカルテストとデバッグに使用します

$ErrorActionPreference = "Stop"

Write-Host "🔍 Thinking Blocks CI/CD Troubleshooting" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# 関数定義
function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor White
}

# 1. 環境チェック
Write-Host "1️⃣  環境チェック" -ForegroundColor Yellow
Write-Host "-------------------"

try {
    $nodeVersion = node --version
    Print-Success "Node.js: $nodeVersion"
} catch {
    Print-Error "Node.js がインストールされていません"
    exit 1
}

try {
    $npmVersion = npm --version
    Print-Success "npm: $npmVersion"
} catch {
    Print-Error "npm がインストールされていません"
    exit 1
}

try {
    $goVersion = go version
    Print-Success "Go: $goVersion"
} catch {
    Print-Warning "Go がインストールされていません（バックエンドテストに必要）"
}

try {
    $dockerVersion = docker --version
    Print-Success "Docker: $dockerVersion"
} catch {
    Print-Warning "Docker がインストールされていません（コンテナビルドに必要）"
}

Write-Host ""

# 2. フロントエンドチェック
Write-Host "2️⃣  フロントエンドチェック" -ForegroundColor Yellow
Write-Host "-------------------------"

Print-Info "依存関係のインストール..."
try {
    npm ci 2>&1 | Out-Null
    Print-Success "依存関係インストール成功"
} catch {
    Print-Error "依存関係のインストールに失敗しました"
    exit 1
}

Print-Info "Lintチェック..."
try {
    npm run lint 2>&1 | Out-Null
    Print-Success "Lint: パス"
} catch {
    Print-Warning "Lint: 警告またはエラーがあります"
    npm run lint
}

Print-Info "型チェック..."
try {
    npm run type-check 2>&1 | Out-Null
    Print-Success "TypeScript: パス"
} catch {
    Print-Error "型エラーがあります"
    npm run type-check
    exit 1
}

Print-Info "ビルド..."
try {
    npm run build 2>&1 | Out-Null
    Print-Success "ビルド: 成功"
} catch {
    Print-Error "ビルドに失敗しました"
    npm run build
    exit 1
}

Write-Host ""

# 3. バックエンドチェック（Goがある場合）
try {
    $goExists = Get-Command go -ErrorAction Stop
    
    Write-Host "3️⃣  バックエンドチェック" -ForegroundColor Yellow
    Write-Host "-----------------------"
    
    Push-Location backend
    
    Print-Info "Go モジュールのダウンロード..."
    try {
        go mod download 2>&1 | Out-Null
        Print-Success "Go モジュール: ダウンロード完了"
    } catch {
        Print-Error "Go モジュールのダウンロードに失敗しました"
        Pop-Location
        exit 1
    }
    
    Print-Info "テスト実行..."
    try {
        go test -v ./... 2>&1 | Out-Null
        Print-Success "テスト: パス"
    } catch {
        Print-Error "テストに失敗しました"
        go test -v ./...
        Pop-Location
        exit 1
    }
    
    Print-Info "ビルド..."
    try {
        go build -v -o thinking-blocks-backend.exe 2>&1 | Out-Null
        Print-Success "ビルド: 成功"
        Remove-Item thinking-blocks-backend.exe -ErrorAction SilentlyContinue
    } catch {
        Print-Error "ビルドに失敗しました"
        Pop-Location
        exit 1
    }
    
    Pop-Location
    Write-Host ""
} catch {
    # Go not installed, skip
}

# 4. Dockerビルドチェック（Dockerがある場合）
try {
    $dockerExists = Get-Command docker -ErrorAction Stop
    
    Write-Host "4️⃣  Dockerビルドチェック" -ForegroundColor Yellow
    Write-Host "------------------------"
    
    Print-Info "フロントエンドイメージのビルド..."
    try {
        docker build -t thinking-blocks-frontend:test . 2>&1 | Out-Null
        Print-Success "フロントエンドイメージ: ビルド成功"
        docker rmi thinking-blocks-frontend:test 2>&1 | Out-Null
    } catch {
        Print-Error "フロントエンドイメージのビルドに失敗しました"
        exit 1
    }
    
    if (Test-Path "backend") {
        Print-Info "バックエンドイメージのビルド..."
        try {
            docker build -t thinking-blocks-backend:test ./backend 2>&1 | Out-Null
            Print-Success "バックエンドイメージ: ビルド成功"
            docker rmi thinking-blocks-backend:test 2>&1 | Out-Null
        } catch {
            Print-Error "バックエンドイメージのビルドに失敗しました"
            exit 1
        }
    }
    
    Write-Host ""
} catch {
    # Docker not installed, skip
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
Write-Host "https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
