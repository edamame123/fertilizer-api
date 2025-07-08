import { vi } from 'vitest'

// Mock環境変数
vi.stubGlobal('process', {
  env: {
    NODE_ENV: 'test',
    RESEND_API_KEY: 'test-key'
  }
})

// グローバルfetchのモック
global.fetch = vi.fn()