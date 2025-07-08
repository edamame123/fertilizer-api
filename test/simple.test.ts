import { describe, it, expect } from 'vitest'

describe('Simple test', () => {
  it('数学計算が正しく動作すること', () => {
    expect(1 + 1).toBe(2)
    expect(2 * 3).toBe(6)
    expect(10 / 2).toBe(5)
  })

  it('文字列操作が正しく動作すること', () => {
    expect('hello'.toUpperCase()).toBe('HELLO')
    expect('world'.length).toBe(5)
    expect('test'.includes('es')).toBe(true)
  })

  it('配列操作が正しく動作すること', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr.includes(2)).toBe(true)
    expect(arr.map(x => x * 2)).toEqual([2, 4, 6])
  })

  it('オブジェクト操作が正しく動作すること', () => {
    const obj = { name: 'テスト', value: 100 }
    expect(obj.name).toBe('テスト')
    expect(obj.value).toBe(100)
    expect(Object.keys(obj)).toEqual(['name', 'value'])
  })

  it('Promise操作が正しく動作すること', async () => {
    const result = await Promise.resolve('success')
    expect(result).toBe('success')
  })
})