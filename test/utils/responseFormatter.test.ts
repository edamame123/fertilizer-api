import { describe, it, expect } from 'vitest'
import { formatApiResponse, formatPaginatedResponse } from '../../server/utils/responseFormatter'

describe('responseFormatter utilities', () => {
  describe('formatApiResponse', () => {
    it('正常なレスポンスが生成されること', () => {
      const data = { name: 'テスト', value: 123 }
      const requestId = 'test-123'
      
      const result = formatApiResponse(data, requestId)
      
      expect(result.meta.status).toBe('success')
      expect(result.data).toEqual(data)
      expect(result.meta.requestId).toBe(requestId)
      expect(result.meta.timestamp).toBeDefined()
    })

    it('空のデータでも正常に処理されること', () => {
      const data = null
      const requestId = 'test-empty'
      
      const result = formatApiResponse(data, requestId)
      
      expect(result.meta.status).toBe('success')
      expect(result.data).toBe(null)
      expect(result.meta.requestId).toBe(requestId)
    })

    it('配列データが正常に処理されること', () => {
      const data = [
        { id: 1, name: 'アイテム1' },
        { id: 2, name: 'アイテム2' }
      ]
      const requestId = 'test-array'
      
      const result = formatApiResponse(data, requestId)
      
      expect(result.meta.status).toBe('success')
      expect(result.data).toEqual(data)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBe(2)
    })

    it('タイムスタンプが正しい形式であること', () => {
      const data = { test: 'data' }
      const requestId = 'test-timestamp'
      
      const result = formatApiResponse(data, requestId)
      
      expect(result.meta.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })

  describe('formatPaginatedResponse', () => {
    it('正常なページネーションレスポンスが生成されること', () => {
      const data = [
        { id: 1, name: 'アイテム1' },
        { id: 2, name: 'アイテム2' }
      ]
      const requestId = 'test-pagination'
      const total = 50
      const page = 2
      const perPage = 10
      
      const result = formatPaginatedResponse(data, requestId, total, page, perPage)
      
      expect(result.meta.status).toBe('success')
      expect(result.data).toEqual(data)
      expect(result.meta.requestId).toBe(requestId)
      expect(result.pagination).toEqual({
        total: 50,
        page: 2,
        perPage: 10,
        pageCount: 5
      })
    })

    it('pageCountが正しく計算されること', () => {
      const data = []
      const requestId = 'test-pages'
      const total = 23
      const page = 1
      const perPage = 10
      
      const result = formatPaginatedResponse(data, requestId, total, page, perPage)
      
      expect(result.pagination.pageCount).toBe(3)
    })

    it('totalが0の場合でも正常に処理されること', () => {
      const data = []
      const requestId = 'test-zero'
      const total = 0
      const page = 1
      const perPage = 10
      
      const result = formatPaginatedResponse(data, requestId, total, page, perPage)
      
      expect(result.pagination.total).toBe(0)
      expect(result.pagination.pageCount).toBe(0)
    })

    it('perPageが1の場合でも正常に処理されること', () => {
      const data = [{ id: 1 }]
      const requestId = 'test-single'
      const total = 5
      const page = 3
      const perPage = 1
      
      const result = formatPaginatedResponse(data, requestId, total, page, perPage)
      
      expect(result.pagination.perPage).toBe(1)
      expect(result.pagination.pageCount).toBe(5)
    })

    it('必要なフィールドが含まれていること', () => {
      const data = [{ test: 'data' }]
      const requestId = 'test-fields'
      const total = 1
      const page = 1
      const perPage = 10
      
      const result = formatPaginatedResponse(data, requestId, total, page, perPage)
      
      expect(result).toHaveProperty('meta')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('pagination')
      expect(result.meta).toHaveProperty('status')
      expect(result.meta).toHaveProperty('requestId')
      expect(result.meta).toHaveProperty('timestamp')
      
      expect(result.pagination).toHaveProperty('total')
      expect(result.pagination).toHaveProperty('page')
      expect(result.pagination).toHaveProperty('perPage')
      expect(result.pagination).toHaveProperty('pageCount')
    })
  })
})