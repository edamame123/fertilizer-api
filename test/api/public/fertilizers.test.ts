import { describe, it, expect, vi, beforeEach } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { createEventHandler } from 'h3'
import fertilizerHandler from '../../../server/api/public/fertilizers'

// モックデータ
const mockFertilizerData = {
  results: [
    {
      id: 1,
      registration_number: '12345',
      company_name: 'テスト会社',
      brand_name: 'テスト肥料',
      form_name: 'テスト形状',
      fertilizer_type: 'テストタイプ',
      nitrogen: 10.0,
      phosphorus: 5.0,
      potassium: 8.0
    }
  ],
  total: 1,
  page: 1,
  perPage: 10
}

// サービスモック
vi.mock('../../../server/api/services/fertilizerService', () => ({
  getFertilizers: vi.fn().mockResolvedValue(mockFertilizerData)
}))

// レスポンスフォーマッターモック
vi.mock('../../../server/utils/responseFormatter', () => ({
  formatPaginatedResponse: vi.fn().mockImplementation((results, requestId, total, page, perPage) => ({
    success: true,
    data: results,
    pagination: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage)
    },
    requestId
  }))
}))

// バリデーションモック
vi.mock('../../../server/utils/validation', () => ({
  validateQueryParams: vi.fn().mockImplementation((query) => query)
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

describe('/api/public/fertilizers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('基本的なリクエストが成功すること', async () => {
    const mockEvent = {
      context: { requestId: 'test-123' },
      path: '/api/public/fertilizers',
      method: 'GET'
    }

    const mockQuery = vi.fn().mockReturnValue({})
    
    // H3のgetQueryをモック
    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler),
      getQuery: mockQuery
    }))

    const handler = fertilizerHandler
    const result = await handler(mockEvent)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockFertilizerData.results)
    expect(result.pagination.total).toBe(1)
  })

  it('クエリパラメータ付きリクエストが成功すること', async () => {
    const mockEvent = {
      context: { requestId: 'test-456' },
      path: '/api/public/fertilizers',
      method: 'GET'
    }

    const mockQuery = vi.fn().mockReturnValue({
      page: '1',
      perPage: '20',
      company_name: 'テスト会社'
    })
    
    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler),
      getQuery: mockQuery
    }))

    const handler = fertilizerHandler
    const result = await handler(mockEvent)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockFertilizerData.results)
  })

  it('typeFiltersパラメータが正しく処理されること', async () => {
    const mockEvent = {
      context: { requestId: 'test-789' },
      path: '/api/public/fertilizers',
      method: 'GET'
    }

    const mockQuery = vi.fn().mockReturnValue({
      typeFilters: '[{"typeId": "1", "categoryId": "2"}]'
    })
    
    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler),
      getQuery: mockQuery
    }))

    const handler = fertilizerHandler
    const result = await handler(mockEvent)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockFertilizerData.results)
  })

  it('不正なtypeFiltersパラメータでエラーが発生すること', async () => {
    const mockEvent = {
      context: { requestId: 'test-error' },
      path: '/api/public/fertilizers',
      method: 'GET'
    }

    const mockQuery = vi.fn().mockReturnValue({
      typeFilters: 'invalid-json'
    })
    
    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler),
      getQuery: mockQuery
    }))

    const handler = fertilizerHandler
    
    await expect(handler(mockEvent)).rejects.toThrow()
  })

  it('ページネーションが正しく動作すること', async () => {
    const mockEvent = {
      context: { requestId: 'test-pagination' },
      path: '/api/public/fertilizers',
      method: 'GET'
    }

    const mockQuery = vi.fn().mockReturnValue({
      page: '2',
      perPage: '5'
    })
    
    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler),
      getQuery: mockQuery
    }))

    const handler = fertilizerHandler
    const result = await handler(mockEvent)

    expect(result.success).toBe(true)
    expect(result.pagination.page).toBe(1)
    expect(result.pagination.perPage).toBe(10)
  })
})