# 🚀 THINKING BLOCKS デプロイガイド

このドキュメントでは、THINKING BLOCKSアプリケーションを本番環境にデプロイする手順を説明します。

## 📋 目次

1. [前提条件](#前提条件)
2. [Railwayセットアップ (バックエンド)](#railwayセットアップ)
3. [Vercelセットアップ (フロントエンド)](#vercelセットアップ)
4. [GitHub Secretsの設定](#github-secretsの設定)
5. [自動デプロイの実行](#自動デプロイの実行)
6. [デプロイ後の確認](#デプロイ後の確認)

---

## 🎯 前提条件

- GitHubアカウント
- Vercelアカウント (無料プラン可)
- Railwayアカウント (無料プラン可)
- Node.js 18以上

---

## 🚂 Railwayセットアップ (バックエンド)

### 1. Railwayアカウント作成

1. https://railway.app にアクセス
2. "Start a New Project" をクリック
3. GitHubでサインイン

### 2. プロジェクト作成

```bash
# Railway CLIをインストール
npm install -g @railway/cli

# ログイン
railway login

# プロジェクト初期化
cd backend
railway init
```

### 3. データベース追加

Railwayダッシュボードで:
1. "New" → "Database" → "PostgreSQL" を選択
2. "New" → "Database" → "Redis" を選択

### 4. 環境変数設定

Railwayダッシュボードで以下を設定:

```env
DATABASE_URL=<自動設定されるPostgreSQLのURL>
REDIS_URL=<自動設定されるRedisのURL>
PORT=8080
JWT_SECRET=<強力なランダム文字列>
ENVIRONMENT=production
GIN_MODE=release
```

### 5. Railway Token取得

```bash
railway token
```

このトークンをコピーして、GitHub Secretsに `RAILWAY_TOKEN` として保存します。

---

## ⚡ Vercelセットアップ (フロントエンド)

### 1. Vercelアカウント作成

1. https://vercel.com にアクセス
2. GitHubでサインイン

### 2. プロジェクトインポート

#### オプションA: Vercel Dashboard (推奨)

1. Vercelダッシュボードで "Add New Project"
2. GitHubリポジトリ `THINKING-BLOCKproto` を選択
3. フレームワーク: **Next.js** を選択
4. ルートディレクトリ: `./` (デフォルト)
5. 環境変数を設定:
   ```
   NEXT_PUBLIC_API_URL=https://thinking-blocks-backend.railway.app/api/v1
   NEXT_PUBLIC_WS_URL=wss://thinking-blocks-backend.railway.app
   ```
6. "Deploy" をクリック

#### オプションB: Vercel CLI

```bash
# Vercel CLIをインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ
vercel --prod
```

### 3. Vercel Token取得

1. Vercelダッシュボード → Settings → Tokens
2. "Create Token" をクリック
3. トークンをコピーして、GitHub Secretsに `VERCEL_TOKEN` として保存

---

## 🔐 GitHub Secretsの設定

GitHubリポジトリで:

1. Settings → Secrets and variables → Actions
2. "New repository secret" をクリック
3. 以下のSecretを追加:

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `RAILWAY_TOKEN` | `railway token` コマンドの出力 | Railway認証トークン |
| `VERCEL_TOKEN` | Vercelダッシュボードから取得 | Vercel認証トークン |

---

## 🎬 自動デプロイの実行

### mainブランチにプッシュで自動デプロイ

```bash
git add .
git commit -m "feat: Add deployment configuration"
git push origin main
```

GitHubで自動的に以下が実行されます:
1. CI/CDパイプライン (テスト・ビルド)
2. バックエンドのRailwayデプロイ
3. フロントエンドのVercelデプロイ

### 手動デプロイ

GitHubリポジトリで:
1. Actions タブ
2. "Deploy to Production" ワークフロー
3. "Run workflow" → "Run workflow"

---

## ✅ デプロイ後の確認

### 1. バックエンド確認

```bash
# ヘルスチェック
curl https://thinking-blocks-backend.railway.app/health

# 期待されるレスポンス
{"status":"ok","timestamp":"2025-11-01T..."}
```

### 2. フロントエンド確認

ブラウザで以下にアクセス:
```
https://thinking-blocks.vercel.app
```

### 3. デプロイメントURL

デプロイが成功すると、以下のURLでアクセスできます:

- **フロントエンド**: https://thinking-blocks.vercel.app
- **バックエンドAPI**: https://thinking-blocks-backend.railway.app/api/v1
- **WebSocket**: wss://thinking-blocks-backend.railway.app

---

## 🔧 トラブルシューティング

### バックエンドがデプロイできない

1. Railway Logsを確認:
   ```bash
   railway logs
   ```

2. 環境変数を確認:
   ```bash
   railway variables
   ```

3. データベース接続を確認:
   - PostgreSQLとRedisが起動しているか
   - DATABASE_URLとREDIS_URLが正しいか

### フロントエンドがデプロイできない

1. Vercel Logsを確認:
   - Vercelダッシュボード → Deployments → 失敗したデプロイをクリック

2. 環境変数を確認:
   - Settings → Environment Variables

3. ビルドエラーの場合:
   ```bash
   # ローカルでビルドテスト
   npm run build
   ```

### CORS エラー

バックエンドの `main.go` で以下を確認:

```go
config := cors.DefaultConfig()
config.AllowOrigins = []string{"https://thinking-blocks.vercel.app"}
config.AllowCredentials = true
```

---

## 🔄 更新デプロイ

コードを更新したら:

```bash
git add .
git commit -m "fix: Update feature"
git push origin main
```

自動的に再デプロイされます。

---

## 📊 モニタリング

### Railway

- ダッシュボード: https://railway.app/project/<your-project-id>
- メトリクス: CPU、メモリ、ネットワーク使用量
- ログ: リアルタイムログ表示

### Vercel

- ダッシュボード: https://vercel.com/dashboard
- Analytics: ページビュー、パフォーマンス
- ログ: Function Logs

---

## 💰 料金プラン

### Railway (無料プラン)

- $5分の無料クレジット/月
- アクティブでない場合は課金なし

### Vercel (無料プラン - Hobby)

- 無制限のデプロイ
- 100GB帯域幅/月
- 商用利用は有料プラン推奨

---

## 🔒 セキュリティ

### 必須設定

1. **JWT_SECRET**: 強力なランダム文字列に変更
   ```bash
   openssl rand -base64 32
   ```

2. **CORS設定**: 本番ドメインのみ許可

3. **環境変数**: GitHub Secretsで管理、コードにハードコードしない

### 推奨設定

- HTTPS強制 (Vercel/Railway自動対応)
- Rate Limiting (実装済み)
- SQL Injection対策 (GORM使用)
- XSS対策 (React自動エスケープ)

---

## 📝 カスタムドメイン設定 (オプション)

### Vercel

1. ドメインを購入 (例: thinking-blocks.com)
2. Vercelダッシュボード → Settings → Domains
3. ドメインを追加し、DNSレコードを設定

### Railway

1. Railwayダッシュボード → Settings → Domains
2. カスタムドメインを追加
3. CNAMEレコードを設定

---

## 🎉 完了!

これでTHINKING BLOCKSがインターネット上で公開されました!

- フロントエンド: https://thinking-blocks.vercel.app
- バックエンド: https://thinking-blocks-backend.railway.app

問題がある場合は、GitHub Issuesで報告してください。
