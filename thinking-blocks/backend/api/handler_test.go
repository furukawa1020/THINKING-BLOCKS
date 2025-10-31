package api_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"thinking-blocks-backend/api"
	"thinking-blocks-backend/database"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// マイグレーション
	err = database.Migrate(db)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func setupTestRouter() (*gin.Engine, *api.Handler) {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	db, _ := setupTestDB()
	handler := api.NewHandler(db, nil)

	return router, handler
}

func TestHealthCheck(t *testing.T) {
	router, handler := setupTestRouter()
	router.GET("/health", handler.HealthCheck)

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "healthy", response["status"])
}

func TestCreateProject(t *testing.T) {
	router, handler := setupTestRouter()
	router.POST("/api/v1/projects", handler.CreateProject)

	project := map[string]interface{}{
		"title":       "Test Project",
		"description": "Test Description",
		"content":     map[string]interface{}{"blocks": []interface{}{}},
		"theme":       "creative",
		"owner":       "test_user",
	}

	jsonData, _ := json.Marshal(project)
	req, _ := http.NewRequest("POST", "/api/v1/projects", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.True(t, response["success"].(bool))
	assert.NotNil(t, response["data"])
}

func TestGetProjects(t *testing.T) {
	router, handler := setupTestRouter()
	router.GET("/api/v1/projects", handler.GetProjects)

	req, _ := http.NewRequest("GET", "/api/v1/projects", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.True(t, response["success"].(bool))
	assert.NotNil(t, response["data"])
}

func TestGetProject(t *testing.T) {
	router, handler := setupTestRouter()

	// プロジェクト作成
	router.POST("/api/v1/projects", handler.CreateProject)
	project := map[string]interface{}{
		"title":   "Test Project",
		"content": map[string]interface{}{"blocks": []interface{}{}},
	}
	jsonData, _ := json.Marshal(project)
	req1, _ := http.NewRequest("POST", "/api/v1/projects", bytes.NewBuffer(jsonData))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)

	var createResponse map[string]interface{}
	json.Unmarshal(w1.Body.Bytes(), &createResponse)
	projectData := createResponse["data"].(map[string]interface{})
	projectID := projectData["id"].(string)

	// プロジェクト取得
	router.GET("/api/v1/projects/:id", handler.GetProject)
	req2, _ := http.NewRequest("GET", "/api/v1/projects/"+projectID, nil)
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)

	assert.Equal(t, http.StatusOK, w2.Code)

	var getResponse map[string]interface{}
	json.Unmarshal(w2.Body.Bytes(), &getResponse)
	assert.True(t, getResponse["success"].(bool))

	getData := getResponse["data"].(map[string]interface{})
	assert.Equal(t, projectID, getData["id"])
}

func TestUpdateProject(t *testing.T) {
	router, handler := setupTestRouter()

	// プロジェクト作成
	router.POST("/api/v1/projects", handler.CreateProject)
	project := map[string]interface{}{
		"title":   "Original Title",
		"content": map[string]interface{}{"blocks": []interface{}{}},
	}
	jsonData, _ := json.Marshal(project)
	req1, _ := http.NewRequest("POST", "/api/v1/projects", bytes.NewBuffer(jsonData))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)

	var createResponse map[string]interface{}
	json.Unmarshal(w1.Body.Bytes(), &createResponse)
	projectData := createResponse["data"].(map[string]interface{})
	projectID := projectData["id"].(string)

	// プロジェクト更新
	router.PUT("/api/v1/projects/:id", handler.UpdateProject)
	updateData := map[string]interface{}{
		"title": "Updated Title",
	}
	updateJSON, _ := json.Marshal(updateData)
	req2, _ := http.NewRequest("PUT", "/api/v1/projects/"+projectID, bytes.NewBuffer(updateJSON))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)

	assert.Equal(t, http.StatusOK, w2.Code)

	var updateResponse map[string]interface{}
	json.Unmarshal(w2.Body.Bytes(), &updateResponse)
	assert.True(t, updateResponse["success"].(bool))
}

func TestDeleteProject(t *testing.T) {
	router, handler := setupTestRouter()

	// プロジェクト作成
	router.POST("/api/v1/projects", handler.CreateProject)
	project := map[string]interface{}{
		"title":   "To Delete",
		"content": map[string]interface{}{"blocks": []interface{}{}},
	}
	jsonData, _ := json.Marshal(project)
	req1, _ := http.NewRequest("POST", "/api/v1/projects", bytes.NewBuffer(jsonData))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)

	var createResponse map[string]interface{}
	json.Unmarshal(w1.Body.Bytes(), &createResponse)
	projectData := createResponse["data"].(map[string]interface{})
	projectID := projectData["id"].(string)

	// プロジェクト削除
	router.DELETE("/api/v1/projects/:id", handler.DeleteProject)
	req2, _ := http.NewRequest("DELETE", "/api/v1/projects/"+projectID, nil)
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)

	assert.Equal(t, http.StatusOK, w2.Code)

	var deleteResponse map[string]interface{}
	json.Unmarshal(w2.Body.Bytes(), &deleteResponse)
	assert.True(t, deleteResponse["success"].(bool))
}
