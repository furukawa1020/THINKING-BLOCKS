# CI/CD設定ガイド

## 概要

このプロジェクトは、GitHub ActionsによるCI/CDパイプラインを実装しています。

## パイプライン構成

### 1. Frontend Job
- **目的**: フロントエンドのビルドとLint
- **実行内容**:
  - Node.js 20のセットアップ
  - `npm ci`で依存関係をインストール
  - `npm run lint`でコード品質チェック
  - `npm run build`でプロダクションビルド
  
### 2. Backend Job
- **目的**: バックエンドのテストとビルド
- **実行内容**:
  - Go 1.21のセットアップ
  - PostgreSQL 16とRedis 7のサービス起動
  - `go test`でユニットテストの実行
  - カバレッジレポートの生成
  - `go build`でバイナリのビルド

### 3. Security Job
- **目的**: セキュリティ脆弱性スキャン
- **実行内容**:
  - Trivyによる脆弱性スキャン
  - GitHub Security Advisoriesへのレポート

### 4. Docker Job
- **目的**: Dockerイメージのビルド（プッシュはスキップ）
- **実行内容**:
  - フロントエンドイメージのビルド
  - バックエンドイメージのビルド
  - GitHub Actionsキャッシュの利用

## エラーハンドリング

CI/CDパイプラインは以下の設定でエラーハンドリングを行っています:

1. **continue-on-error**: 一部のジョブは失敗してもパイプライン全体を停止しません
   - Lintエラー（警告として扱う）
   - テストエラー（カバレッジレポートは生成）
   - セキュリティスキャン（情報提供のみ）
   - Codecovアップロード（オプション）

2. **if: always()**: 前のステップが失敗しても実行するステップ
   - カバレッジレポート生成
   - セキュリティレポートアップロード

3. **if: success()**: 前のステップが成功した場合のみ実行
   - ビルドアーティファクトのアップロード

## ローカルでのテスト方法

### フロントエンド
```bash
npm ci
npm run lint
npm run type-check
npm run build
```

### バックエンド
```bash
cd backend
go mod download
go test -v -race -coverprofile=coverage.out ./...
go build -v -o thinking-blocks-backend
```

### Docker
```bash
# フロントエンド
docker build -t thinking-blocks-frontend .

# バックエンド
docker build -t thinking-blocks-backend ./backend
```

## トラブルシューティング

### Lintエラー
- ESLint設定を確認: `eslint.config.mjs`
- Next.js Lintを実行: `npm run lint -- --fix`

### ビルドエラー
- TypeScriptエラーを確認: `npm run type-check`
- 依存関係を再インストール: `rm -rf node_modules package-lock.json && npm install`

### テストエラー
- データベース接続を確認
- Redis接続を確認
- 環境変数を確認

### Dockerビルドエラー
- Dockerfileの構文を確認
- ビルドコンテキストのファイルを確認
- マルチステージビルドのステージ名を確認

## GitHub Secrets（オプション）

Docker Hubへのプッシュやデプロイを有効にする場合は、以下のSecretsを設定してください:

- `DOCKER_USERNAME`: Docker Hubユーザー名
- `DOCKER_PASSWORD`: Docker Hubパスワード/トークン
- `RAILWAY_TOKEN`: Railway APIトークン
- `CODECOV_TOKEN`: Codecovトークン（オプション）

## キャッシュ戦略

### Node.js
- `npm ci`は`package-lock.json`を使用してキャッシュ
- `node_modules`はGitHub Actionsがキャッシュ

### Go
- Goモジュールキャッシュ: `~/go/pkg/mod`
- ビルドキャッシュ: `~/.cache/go-build`

### Docker
- GitHub Actions Cacheバックエンドを使用
- `cache-from: type=gha`と`cache-to: type=gha`でレイヤーキャッシュ

## パフォーマンス最適化

1. **並列実行**: 独立したジョブは並列実行
2. **キャッシュ**: 依存関係とビルド成果物をキャッシュ
3. **条件付き実行**: 必要な場合のみジョブを実行
4. **アーティファクト**: ビルド成果物を次のジョブで再利用

## CI/CD改善案

- [ ] E2Eテストの追加（Playwright/Cypress）
- [ ] パフォーマンステスト
- [ ] ビジュアルリグレッションテスト
- [ ] 自動デプロイ（mainブランチ→本番環境）
- [ ] ステージング環境へのデプロイ（developブランチ）
- [ ] Slack/Discord通知
- [ ] デプロイメントレビュー（GitHub Environments）
