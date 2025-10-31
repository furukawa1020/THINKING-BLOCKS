package utils

import (
	"errors"
	"net/http"
)

// カスタムエラー型
var (
	ErrNotFound          = errors.New("resource not found")
	ErrUnauthorized      = errors.New("unauthorized")
	ErrForbidden         = errors.New("forbidden")
	ErrBadRequest        = errors.New("bad request")
	ErrInternalServer    = errors.New("internal server error")
	ErrConflict          = errors.New("resource conflict")
	ErrTooManyRequests   = errors.New("too many requests")
	ErrServiceUnavailable = errors.New("service unavailable")
)

// AppError - アプリケーションエラー
type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

func (e *AppError) Error() string {
	return e.Message
}

// NewAppError - 新しいアプリケーションエラーを作成
func NewAppError(code int, message string, details string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Details: details,
	}
}

// エラー変換ヘルパー
func NewNotFoundError(details string) *AppError {
	return NewAppError(http.StatusNotFound, "Resource not found", details)
}

func NewUnauthorizedError(details string) *AppError {
	return NewAppError(http.StatusUnauthorized, "Unauthorized", details)
}

func NewForbiddenError(details string) *AppError {
	return NewAppError(http.StatusForbidden, "Forbidden", details)
}

func NewBadRequestError(details string) *AppError {
	return NewAppError(http.StatusBadRequest, "Bad request", details)
}

func NewInternalServerError(details string) *AppError {
	return NewAppError(http.StatusInternalServerError, "Internal server error", details)
}

func NewConflictError(details string) *AppError {
	return NewAppError(http.StatusConflict, "Resource conflict", details)
}

// ErrorResponse - エラーレスポンス構造
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
	Code    int    `json:"code"`
}

// NewErrorResponse - エラーレスポンスを作成
func NewErrorResponse(err error) *ErrorResponse {
	if appErr, ok := err.(*AppError); ok {
		return &ErrorResponse{
			Success: false,
			Error:   appErr.Message,
			Details: appErr.Details,
			Code:    appErr.Code,
		}
	}

	return &ErrorResponse{
		Success: false,
		Error:   err.Error(),
		Code:    http.StatusInternalServerError,
	}
}
