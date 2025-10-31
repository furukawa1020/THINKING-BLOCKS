package cache

import (
	"context"
	"encoding/json"
	"time"

	"github.com/go-redis/redis/v8"
)

type Cache struct {
	client *redis.Client
	ctx    context.Context
}

func NewCache(client *redis.Client) *Cache {
	return &Cache{
		client: client,
		ctx:    context.Background(),
	}
}

// Get - キャッシュから取得
func (c *Cache) Get(key string, dest interface{}) error {
	if c.client == nil {
		return redis.Nil
	}

	val, err := c.client.Get(c.ctx, key).Result()
	if err != nil {
		return err
	}

	return json.Unmarshal([]byte(val), dest)
}

// Set - キャッシュに保存
func (c *Cache) Set(key string, value interface{}, expiration time.Duration) error {
	if c.client == nil {
		return nil
	}

	json, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return c.client.Set(c.ctx, key, json, expiration).Err()
}

// Delete - キャッシュから削除
func (c *Cache) Delete(key string) error {
	if c.client == nil {
		return nil
	}

	return c.client.Del(c.ctx, key).Err()
}

// DeletePattern - パターンマッチで削除
func (c *Cache) DeletePattern(pattern string) error {
	if c.client == nil {
		return nil
	}

	iter := c.client.Scan(c.ctx, 0, pattern, 0).Iterator()
	for iter.Next(c.ctx) {
		if err := c.client.Del(c.ctx, iter.Val()).Err(); err != nil {
			return err
		}
	}

	return iter.Err()
}

// Exists - キャッシュの存在確認
func (c *Cache) Exists(key string) (bool, error) {
	if c.client == nil {
		return false, nil
	}

	result, err := c.client.Exists(c.ctx, key).Result()
	return result > 0, err
}

// Increment - 数値をインクリメント
func (c *Cache) Increment(key string) (int64, error) {
	if c.client == nil {
		return 0, nil
	}

	return c.client.Incr(c.ctx, key).Result()
}

// GetOrSet - キャッシュ取得、なければ生成して保存
func (c *Cache) GetOrSet(key string, dest interface{}, expiration time.Duration, generator func() (interface{}, error)) error {
	// キャッシュから取得試行
	err := c.Get(key, dest)
	if err == nil {
		return nil
	}

	// キャッシュにない場合は生成
	value, err := generator()
	if err != nil {
		return err
	}

	// キャッシュに保存
	if err := c.Set(key, value, expiration); err != nil {
		return err
	}

	// destに値をコピー
	jsonData, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return json.Unmarshal(jsonData, dest)
}
