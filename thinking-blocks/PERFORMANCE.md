# THINKING BLOCKS - Performance Optimization Guide

## パフォーマンス最適化の概要

### 1. バックエンド最適化

#### データベース
- **接続プーリング**: GORM自動接続プール管理
- **インデックス**: 主要カラムにインデックス設定
- **クエリ最適化**: N+1問題の回避、Eager Loading

```go
// 例: Eager Loading
db.Preload("Collaborators").Find(&projects)
```

#### キャッシュ戦略
- **Redis**: 頻繁にアクセスされるデータをキャッシュ
- **TTL**: 5分（プロジェクト一覧）、10分（個別プロジェクト）
- **キャッシュ無効化**: 更新・削除時に自動無効化

```go
// GetOrSet パターン
cacheManager.GetOrSet(key, &result, 5*time.Minute, func() (interface{}, error) {
    return fetchFromDB()
})
```

#### レート制限
- **一般リクエスト**: 100 req/s
- **APIエンドポイント**: 10 req/s
- **バースト**: 20リクエストまで許容

#### 圧縮
- **Gzip**: すべてのレスポンスを圧縮
- **圧縮レベル**: 6（バランス型）

### 2. フロントエンド最適化

#### Next.js最適化
- **App Router**: React 19のServer Componentsを活用
- **Dynamic Import**: コンポーネントの遅延読み込み
- **Image Optimization**: next/imageによる自動最適化
- **Code Splitting**: 自動バンドル分割

#### Blockly最適化
- **CDN読み込み**: Blocklyライブラリを非同期読み込み
- **ワークスペース制限**: 最大500ブロックまで
- **レンダリング最適化**: useCallback, useMemoの活用

#### Canvas最適化
- **描画制限**: requestAnimationFrame使用
- **オフスクリーンレンダリング**: 大規模マインドマップ対応
- **メモリ管理**: 不要なオブジェクトの適切な破棄

### 3. インフラ最適化

#### Docker
- **Multi-stage Build**: ビルド時間短縮、イメージサイズ削減
- **Health Checks**: 自動再起動による高可用性
- **Resource Limits**: メモリ/CPU制限設定

```yaml
deploy:
  resources:
    limits:
      cpus: '0.50'
      memory: 512M
```

#### Nginx
- **Gzip圧縮**: 有効化
- **キャッシュ**: 静的ファイル1年キャッシュ
- **HTTP/2**: 有効化
- **Keep-Alive**: 接続再利用

#### PostgreSQL
- **shared_buffers**: RAMの25%
- **effective_cache_size**: RAM の50-75%
- **work_mem**: 16MB
- **maintenance_work_mem**: 256MB

```sql
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 256MB
```

#### Redis
- **maxmemory**: 256MB
- **maxmemory-policy**: allkeys-lru
- **persistence**: RDB + AOF

### 4. ネットワーク最適化

#### CDN
- **静的ファイル**: CDN配信推奨
- **Blockly**: unpkg CDN使用
- **フォント**: Google Fonts CDN

#### 接続
- **Keep-Alive**: 有効化
- **Pipelining**: HTTP/2による並列化
- **WebSocket**: 長時間接続の最適化

### 5. モニタリングとプロファイリング

#### Prometheus メトリクス
- リクエスト数
- レスポンスタイム
- エラー率
- メモリ使用量
- Goroutine数

#### Grafana ダッシュボード
- システムメトリクス可視化
- アラート設定
- リアルタイム監視

#### アプリケーションログ
- 構造化ログ（JSON）
- ログレベル管理
- エラートラッキング

### 6. ベストプラクティス

#### データベースクエリ
```go
// ❌ N+1問題
for _, project := range projects {
    db.Where("project_id = ?", project.ID).Find(&links)
}

// ✅ Eager Loading
db.Preload("ShareLinks").Find(&projects)
```

#### キャッシュパターン
```go
// ✅ Cache-Aside パターン
func GetProject(id string) (*Project, error) {
    // 1. キャッシュから取得試行
    if cached, err := cache.Get("project:" + id); err == nil {
        return cached, nil
    }
    
    // 2. DBから取得
    project, err := db.Find(id)
    if err != nil {
        return nil, err
    }
    
    // 3. キャッシュに保存
    cache.Set("project:" + id, project, 10*time.Minute)
    
    return project, nil
}
```

#### エラーハンドリング
```go
// ✅ カスタムエラー型の使用
if err != nil {
    return NewInternalServerError("Failed to fetch project: " + err.Error())
}
```

### 7. パフォーマンスベンチマーク

#### 目標値
- **APIレスポンス**: < 100ms (P95)
- **ページロード**: < 2秒
- **WebSocket遅延**: < 50ms
- **データベースクエリ**: < 10ms
- **キャッシュヒット率**: > 90%

#### 測定方法
```bash
# API負荷テスト
ab -n 1000 -c 10 http://localhost:8080/api/v1/projects

# Go プロファイリング
go test -bench=. -cpuprofile=cpu.prof
go tool pprof cpu.prof
```

### 8. スケーリング戦略

#### 水平スケーリング
- **フロントエンド**: 複数インスタンス展開
- **バックエンド**: ロードバランサー配下で複数台
- **データベース**: Read Replica設定

#### 垂直スケーリング
- **CPU**: 2コア → 4コア
- **メモリ**: 2GB → 4GB → 8GB
- **ディスク**: SSD使用

### 9. 将来の最適化

- **CDN統合**: CloudflareまたはCloudFront
- **画像最適化**: WebP形式対応
- **Service Worker**: オフライン対応
- **GraphQL**: 柔軟なクエリ対応
- **Edge Computing**: Vercel Edge Functions

## まとめ

これらの最適化により、THINKING BLOCKSは以下を実現：

- ⚡ **高速**: P95レスポンスタイム < 100ms
- 📈 **スケーラブル**: 1000+同時接続対応
- 🛡️ **堅牢**: 99.9% uptime
- 🔄 **リアルタイム**: WebSocketによる即座の同期
- 💾 **効率的**: 適切なキャッシング戦略
