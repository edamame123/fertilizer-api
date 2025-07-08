import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import { validateQueryParams, validateSimple } from '../../server/utils/validation'

// エラーハンドラーモック
vi.mock('../../server/utils/errorHandler', () => ({
  ErrorCode: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MISSING_PARAMETER: 'MISSING_PARAMETER'
  },
  createApiError: vi.fn((statusCode, errorCode, message, details, requestId) => {
    const error = new Error(message)
    error.statusCode = statusCode
    error.errorCode = errorCode
    error.details = details
    error.requestId = requestId
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

describe('validation utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateQueryParams', () => {
    it('正常なクエリパラメータが検証されること', () => {
      const query = {
        page: '1',
        perPage: '10',
        company_name: 'テスト会社'
      }
      
      const result = validateQueryParams(query, 'test-123')
      
      expect(result.page).toBe(1)
      expect(result.perPage).toBe(10)
      expect(result.company_name).toBe('テスト会社')
    })

    it('pageパラメータが数値に変換されること', () => {
      const query = {
        page: '5',
        perPage: '20'
      }
      
      const result = validateQueryParams(query, 'test-456')
      
      expect(result.page).toBe(5)
      expect(result.perPage).toBe(20)
    })

    it('範囲パラメータが正しく処理されること', () => {
      const query = {
        nitrogen_min: '5.0',
        nitrogen_max: '15.0',
        phosphorus_min: '2.0',
        phosphorus_max: '8.0'
      }
      
      const result = validateQueryParams(query, 'test-789')
      
      expect(result.nitrogen_min).toBe(5.0)
      expect(result.nitrogen_max).toBe(15.0)
      expect(result.phosphorus_min).toBe(2.0)
      expect(result.phosphorus_max).toBe(8.0)
    })

    it('不正なページ番号でエラーが発生すること', () => {
      const query = {
        page: '-1'
      }
      
      expect(() => validateQueryParams(query, 'test-error')).toThrow()
    })

    it('不正なperPageでエラーが発生すること', () => {
      const query = {
        perPage: '101'
      }
      
      expect(() => validateQueryParams(query, 'test-error')).toThrow()
    })

    it('不正な数値範囲でエラーが発生すること', () => {
      const query = {
        nitrogen_min: 'invalid'
      }
      
      expect(() => validateQueryParams(query, 'test-error')).toThrow()
    })

    it('showFormNameパラメータが適切に処理されること', () => {
      const query = {
        showFormName: 'true'
      }
      
      const result = validateQueryParams(query, 'test-form')
      
      expect(result.showFormName).toBe(true)
    })

    it('typeFiltersパラメータが適切に処理されること', () => {
      const typeFilters = [
        { typeId: '1', categoryId: '2' }
      ]
      
      const query = {
        typeFilters
      }
      
      const result = validateQueryParams(query, 'test-filters')
      
      expect(result.typeFilters).toEqual(typeFilters)
    })
  })

  describe('validateSimple', () => {
    it('正常なデータが検証されること', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      })
      
      const data = {
        name: 'テスト',
        age: 25
      }
      
      const result = validateSimple(
        schema,
        data,
        'VALIDATION_ERROR',
        'Validation failed',
        'test-123'
      )
      
      expect(result.name).toBe('テスト')
      expect(result.age).toBe(25)
    })

    it('必須フィールドが不足している場合にエラーが発生すること', () => {
      const schema = z.object({
        required_field: z.string()
      })
      
      const data = {}
      
      expect(() => validateSimple(
        schema,
        data,
        'MISSING_PARAMETER',
        'Required field missing',
        'test-error'
      )).toThrow()
    })

    it('型が不正な場合にエラーが発生すること', () => {
      const schema = z.object({
        number_field: z.number()
      })
      
      const data = {
        number_field: 'not-a-number'
      }
      
      expect(() => validateSimple(
        schema,
        data,
        'VALIDATION_ERROR',
        'Type mismatch',
        'test-error'
      )).toThrow()
    })
  })
})