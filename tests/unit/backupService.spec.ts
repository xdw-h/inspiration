// @vitest-environment node
import 'fake-indexeddb/auto'
import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { InspirationDatabase } from '../../src/shared/db/database'
import { exportBackup, importBackup } from '../../src/features/backup/backupService'

if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class<T = unknown> extends Event {
    detail: T
    constructor(type: string, init?: CustomEventInit<T>) { super(type, init); this.detail = init?.detail as T }
  } as unknown as typeof CustomEvent
}

describe('backup', () => {
  it('round-trips ideas and audio', async () => {
    const source = new InspirationDatabase(`source-${randomUUID()}`)
    const target = new InspirationDatabase(`target-${randomUUID()}`)
    await source.ideas.add({ id: 'i1', title: '声音', body: '', status: 'inbox', favorite: false, tagIds: [], createdAt: '2026-08-18T00:00:00.000Z', updatedAt: '2026-08-18T00:00:00.000Z' })
    await source.audioAssets.add({ id: 'a1', ideaId: 'i1', blob: new Blob(['voice']), mimeType: 'audio/webm', size: 5, durationMs: 1000, createdAt: '2026-08-18T00:00:00.000Z' })
    const result = await importBackup(await exportBackup(source), target)
    expect(result).toEqual({ imported: 1, skipped: 0, audio: 1 })
    expect(await target.audioAssets.get('a1')).toBeTruthy()
    await source.delete(); await target.delete()
  })

  it('rejects invalid backup without changing existing data', async () => {
    const target = new InspirationDatabase(`target-${randomUUID()}`)
    await expect(importBackup(new Blob(['broken']), target)).rejects.toThrow('备份文件损坏或格式不正确')
    expect(await target.ideas.count()).toBe(0)
    await target.delete()
  })
})
