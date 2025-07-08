import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorCode, createApiError, logApiError, ErrorMessages } from '../../server/utils/errorHandler'

// H3のcreateErrorモック
vi.mock('h3', () => ({
  createError: vi.fn((config) => {
    const error = new Error(config.statusMessage || 'Test Error')
    error.statusCode = config.statusCode
    error.data = config.data
    return error
  })
}))

// ログモック
vi.mock('../../server/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

describe('errorHandler utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ErrorCode', () => {
    it('すべてのエラーコードが定義されていること', () => {
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(ErrorCode.MISSING_PARAMETER).toBe('MISSING_PARAMETER')
      expect(ErrorCode.INVALID_PARAMETER).toBe('INVALID_PARAMETER')
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
      expect(ErrorCode.DATABASE_ERROR).toBe('DATABASE_ERROR')
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND')
    })
  })

  describe('ErrorMessages', () => {
    it('すべてのエラーメッセージが定義されていること', () => {
      expect(ErrorMessages[ErrorCode.VALIDATION_ERROR]).toBe('リクエストパラメータが無効です')
      expect(ErrorMessages[ErrorCode.MISSING_PARAMETER]).toBe('必須パラメータが不足しています')
      expect(ErrorMessages[ErrorCode.INTERNAL_ERROR]).toBe('サーバー内部エラーが発生しました')
      expect(ErrorMessages[ErrorCode.DATABASE_ERROR]).toBe('データベース接続エラーが発生しました')
      expect(ErrorMessages[ErrorCode.NOT_FOUND]).toBe('リクエストされたリソースが見つかりません')
    })
  })

  describe('createApiError', () => {
    it('基本的なAPIエラーが作成されること', () => {
      const error = createApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'テストエラー',
        undefined,
        'test-123'
      )
      
      expect(error.statusCode).toBe(400)
      expect(error.errorCode).toBe(ErrorCode.VALIDATION_ERROR)
      expect(error.message).toBe('テストエラー')
      expect(error.requestId).toBe('test-123')
      expect(error.timestamp).toBeDefined()
    })

    it('詳細情報付きのAPIエラーが作成されること', () => {
      const details = [
        { field: 'name', issue: 'required' },
        { field: 'age', issue: 'invalid_type' }
      ]
      
      const error = createApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'バリデーションエラー',
        details,
        'test-456'
      )
      
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual(details)
    })

    it('異なるHTTPステータスコードでエラーが作成されること', () => {
      const error404 = createApiError(
        404,
        ErrorCode.NOT_FOUND,
        'リソースが見つかりません',
        undefined,
        'test-404'
      )
      
      expect(error404.statusCode).toBe(404)
      expect(error404.errorCode).toBe(ErrorCode.NOT_FOUND)
      
      const error500 = createApiError(
        500,
        ErrorCode.INTERNAL_ERROR,
        'サーバーエラー',
        undefined,
        'test-500'
      )
      
      expect(error500.statusCode).toBe(500)
      expect(error500.errorCode).toBe(ErrorCode.INTERNAL_ERROR)
    })

    it('タイムスタンプが正しい形式であること', () => {
      const error = createApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'テストエラー',
        undefined,
        'test-timestamp'
      )
      
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })

  describe('logApiError', () => {
    it('基本的なエラーログが記録されること', () => {
      const logger = vi.mocked(require('../../server/utils/logger').logger)
      
      const error = new Error('テストエラー')
      const context = {
        requestId: 'test-123',
        path: '/api/test',
        method: 'GET'
      }
      
      logApiError(error, context)
      
      expect(logger.error).toHaveBeenCalledWith(
        'API Error',
        expect.objectContaining({
          requestId: 'test-123',
          path: '/api/test',
          method: 'GET'
        }),
        expect.objectContaining({
          error: 'テストエラー'
        })
      )
    })

    it('APIエラーの詳細情報が記録されること', () => {
      const logger = vi.mocked(require('../../server/utils/logger').logger)
      
      const error = createApiError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'バリデーションエラー',
        [{ field: 'name', issue: 'required' }],
        'test-456'
      )
      
      const context = {
        requestId: 'test-456',
        path: '/api/test',
        method: 'POST'
      }
      
      logApiError(error, context)
      
      expect(logger.error).toHaveBeenCalledWith(
        'API Error',
        expect.objectContaining({
          requestId: 'test-456',
          path: '/api/test',
          method: 'POST'
        }),
        expect.objectContaining({
          error: 'バリデーションエラー',
          statusCode: 400,
          errorCode: ErrorCode.VALIDATION_ERROR,
          details: [{ field: 'name', issue: 'required' }]
        })
      )
    })

    it('スタックトレースが記録されること', () => {
      const logger = vi.mocked(require('../../server/utils/logger').logger)
      
      const error = new Error('テストエラー')
      const context = {
        requestId: 'test-stack',
        path: '/api/test',
        method: 'GET'
      }
      
      logApiError(error, context)
      
      expect(logger.error).toHaveBeenCalledWith(
        'API Error',
        expect.anything(),
        expect.objectContaining({
          stack: expect.any(String)
        })
      )
    })
  })
})