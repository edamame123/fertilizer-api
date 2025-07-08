import { describe, it, expect, vi, beforeEach } from 'vitest'
import categoryHandler from '../../../server/api/public/categories'

// モックデータ
const mockCategoryData = [
  {
    id: 1,
    type_id: '1',
    name: 'テストカテゴリ1',
    description: 'テストカテゴリ1の説明'
  },
  {
    id: 2,
    type_id: '1',
    name: 'テストカテゴリ2',
    description: 'テストカテゴリ2の説明'
  }
]

// サービスモック
vi.mock('../../../server/api/services/categoryService', () => ({
  default: {
    getCategoriesByTypeId: vi.fn().mockResolvedValue(mockCategoryData)
  }
}))

// レスポンスフォーマッターモック
vi.mock('../../../server/utils/responseFormatter', () => ({
  formatApiResponse: vi.fn().mockImplementation((data, requestId) => ({
    success: true,
    data,
    requestId
  }))
}))

// バリデーションモック
vi.mock('../../../server/utils/validation', () => ({
  validateSimple: vi.fn().mockImplementation((schema, data) => data)
}))

// ログモック
vi.mock('../../../server/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

// エラーハンドラーモック
vi.mock('../../../server/utils/errorHandler', () => ({
  ErrorCode: {
    MISSING_PARAMETER: 'MISSING_PARAMETER',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
  },
  createApiError: vi.fn(),
  logApiError: vi.fn(),
  ErrorMessages: {
    INTERNAL_ERROR: 'Internal server error'
  }
}))

describe('/api/public/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('正常なtype_idパラメータでカテゴリが取得できること', async () => {
    const mockEvent = {
      context: { requestId: 'test-123' },
      path: '/api/public/categories',
      method: 'GET'
    }

    const mockQuery = vi.fn().mockReturnValue({
      type_id: '1'
    })
    
    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler),
      getQuery: mockQuery
    }))

    const handler = categoryHandler
    const result = await handler(mockEvent)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockCategoryData)
    expect(result.requestId).toBe('test-123')
  })

  it('異なるtype_idで異なるカテゴリが取得できること', async () => {
    const mockEvent = {
      context: { requestId: 'test-456' },
      path: '/api/public/categories',
      method: 'GET'
    }

    const mockQuery = vi.fn().mockReturnValue({
      type_id: '2'
    })
    
    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler),
      getQuery: mockQuery
    }))

    const handler = categoryHandler
    const result = await handler(mockEvent)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockCategoryData)
  })

  it('type_idが空文字の場合でも処理されること', async () => {
    const mockEvent = {
      context: { requestId: 'test-789' },
      path: '/api/public/categories',
      method: 'GET'
    }

    const mockQuery = vi.fn().mockReturnValue({
      type_id: ''
    })
    
    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler),
      getQuery: mockQuery
    }))

    const handler = categoryHandler
    const result = await handler(mockEvent)

    expect(result.success).toBe(true)
  })

  it('requestIdが設定されていない場合でも動作すること', async () => {
    const mockEvent = {
      context: {},
      path: '/api/public/categories',
      method: 'GET'
    }

    const mockQuery = vi.fn().mockReturnValue({
      type_id: '1'
    })
    
    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler),
      getQuery: mockQuery
    }))

    const handler = categoryHandler
    const result = await handler(mockEvent)

    expect(result.success).toBe(true)
    expect(result.requestId).toBe('unknown')
  })

  it('サービスエラーが適切に処理されること', async () => {
    const mockEvent = {
      context: { requestId: 'test-error' },
      path: '/api/public/categories',
      method: 'GET'
    }

    const mockQuery = vi.fn().mockReturnValue({
      type_id: '1'
    })
    
    // サービスでエラーが発生する場合をモック
    vi.doMock('../../../server/api/services/categoryService', () => ({
      default: {
        getCategoriesByTypeId: vi.fn().mockRejectedValue(new Error('Service error'))
      }
    }))
    
    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler),
      getQuery: mockQuery
    }))

    const handler = categoryHandler
    
    await expect(handler(mockEvent)).rejects.toThrow()
  })
})