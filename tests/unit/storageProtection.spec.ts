import { describe, expect, it, vi } from 'vitest'
import { getStorageProtectionStatus, requestStorageProtection } from '../../src/features/storage/storageProtection'

describe('storage protection', () => {
  it('returns usage, quota and persisted state', async () => {
    const storage = { estimate: vi.fn().mockResolvedValue({ usage: 1024, quota: 4096 }), persisted: vi.fn().mockResolvedValue(true), persist: vi.fn() }
    await expect(getStorageProtectionStatus(storage)).resolves.toEqual({ supported: true, persisted: true, usage: 1024, quota: 4096 })
  })
  it('reports unsupported storage safely', async () => {
    await expect(requestStorageProtection(undefined)).resolves.toEqual({ supported: false, persisted: false, usage: null, quota: null })
  })
})
