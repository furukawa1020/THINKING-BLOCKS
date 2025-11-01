# Go バックエンド用 Dockerfile
FROM golang:1.23-alpine AS builder

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のコピー
COPY go.mod go.sum* ./

# 依存関係のダウンロード
RUN go mod download

# ソースコードのコピー
COPY . .

# ビルド
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# 本番環境用の軽量イメージ
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# ビルドしたバイナリをコピー
COPY --from=builder /app/main .

# ポートを公開
EXPOSE 8080

# アプリケーションの起動
CMD ["./main"]
