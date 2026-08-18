import { beforeEach, describe, expect, it } from 'vitest'
import { createAppLockStore } from '../../src/features/privacy/appLockStore'

describe('app lock store', () => {
  beforeEach(() => localStorage.clear())
  it('requires a six digit pin', async () => {
    const store = createAppLockStore(localStorage, async (value) => `hash:${[...value].reverse().join('')}`)
    await expect(store.setup('123')).rejects.toThrow('请输入 6 位数字密码')
  })
  it('stores only a hash and verifies the pin', async () => {
    const store = createAppLockStore(localStorage, async (value) => `hash:${[...value].reverse().join('')}`)
    await store.setup('123456')
    expect(localStorage.getItem('inspiration-lock-hash')).not.toContain('123456')
    await expect(store.verify('123456')).resolves.toBe(true)
    await expect(store.verify('654321')).resolves.toBe(false)
  })
})
