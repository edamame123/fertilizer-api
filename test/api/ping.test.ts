import { describe, it, expect, vi, beforeEach } from 'vitest'
import pingHandler from '../../server/api/ping'

// ログモック
vi.mock('../../server/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

describe('/api/ping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('pingエンドポイントが正常に応答すること', async () => {
    const mockEvent = {
      context: { requestId: 'test-ping' },
      path: '/api/ping',
      method: 'GET'
    }

    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler)
    }))

    const handler = pingHandler
    const result = await handler(mockEvent)

    expect(result.success).toBe(true)
    expect(result.message).toBe('API is running')
    expect(result.requestId).toBe('test-ping')
    expect(result.timestamp).toBeDefined()
  })

  it('requestIdが設定されていない場合でも動作すること', async () => {
    const mockEvent = {
      context: {},
      path: '/api/ping',
      method: 'GET'
    }

    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler)
    }))

    const handler = pingHandler
    const result = await handler(mockEvent)

    expect(result.success).toBe(true)
    expect(result.message).toBe('API is running')
    expect(result.requestId).toBe('unknown')
    expect(result.timestamp).toBeDefined()
  })

  it('タイムスタンプが正しい形式であること', async () => {
    const mockEvent = {
      context: { requestId: 'test-timestamp' },
      path: '/api/ping',
      method: 'GET'
    }

    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler)
    }))

    const handler = pingHandler
    const result = await handler(mockEvent)

    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })

  it('レスポンスに必要なフィールドが含まれていること', async () => {
    const mockEvent = {
      context: { requestId: 'test-fields' },
      path: '/api/ping',
      method: 'GET'
    }

    vi.doMock('h3', () => ({
      defineEventHandler: vi.fn((handler) => handler)
    }))

    const handler = pingHandler
    const result = await handler(mockEvent)

    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('message')
    expect(result).toHaveProperty('requestId')
    expect(result).toHaveProperty('timestamp')
    expect(typeof result.success).toBe('boolean')
    expect(typeof result.message).toBe('string')
    expect(typeof result.requestId).toBe('string')
    expect(typeof result.timestamp).toBe('string')
  })
})