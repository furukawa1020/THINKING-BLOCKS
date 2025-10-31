package utils

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"strings"
)

// GenerateToken - ランダムトークンを生成
func GenerateToken(length int) (string, error) {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b)[:length], nil
}

// SanitizeString - 文字列のサニタイズ
func SanitizeString(s string) string {
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, "\x00", "")
	return s
}

// ValidateEmail - メールアドレスの検証
func ValidateEmail(email string) bool {
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// ToJSON - 構造体をJSON文字列に変換
func ToJSON(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}

// FromJSON - JSON文字列を構造体に変換
func FromJSON(s string, v interface{}) error {
	return json.Unmarshal([]byte(s), v)
}

// Contains - スライスに要素が含まれるか
func Contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// Unique - スライスから重複を削除
func Unique(slice []string) []string {
	keys := make(map[string]bool)
	list := []string{}
	for _, entry := range slice {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}

// Paginate - ページネーションのオフセットとリミットを計算
func Paginate(page, pageSize int) (offset int, limit int) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}
	offset = (page - 1) * pageSize
	limit = pageSize
	return
}
