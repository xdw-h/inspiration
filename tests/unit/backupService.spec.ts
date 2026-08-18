// @vitest-environment node
import 'fake-indexeddb/auto'
import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { InspirationDatabase } from '../../src/shared/db/database'
import { exportBackup, importBackup } from '../../src/features/backup/backupService'
import JSZip from 'jszip'

if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class<T = unknown> extends Event {
    detail: T
    constructor(type: string, init?: CustomEventInit<T>) { super(type, init); this.detail = init?.detail as T }
  } as unknown as typeof CustomEvent
}

describe('backup', () => {
  async function backupBlob(manifest: object, data: object, files: Record<string, string> = {}) {
    const zip = new JSZip(); zip.file('manifest.json', JSON.stringify(manifest)); zip.file('ideas.json', JSON.stringify(data)); Object.entries(files).forEach(([name, value]) => zip.file(name, value))
    return new Blob([await zip.generateAsync({ type: 'uint8array' })], { type: 'application/zip' })
  }
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

  it('rejects incompatible versions and missing audio before writing', async () => {
    const target = new InspirationDatabase(`target-${randomUUID()}`)
    const empty = { ideas: [], tags: [], transcripts: [], audio: [] }
    await expect(importBackup(await backupBlob({ version: 2, createdAt: '', ideas: 0, audio: 0 }, empty), target)).rejects.toThrow('备份版本不兼容')
    const idea = { id: 'i1', title: '', body: '', status: 'inbox', favorite: false, tagIds: [], createdAt: '', updatedAt: '' }
    const audio = { id: 'a1', ideaId: 'i1', mimeType: 'audio/webm', size: 1, durationMs: 1, createdAt: '', file: 'audio/a1.webm' }
    await expect(importBackup(await backupBlob({ version: 1, createdAt: '', ideas: 1, audio: 1 }, { ideas: [idea], tags: [], transcripts: [], audio: [audio] }), target)).rejects.toThrow('备份缺少音频')
    expect(await target.ideas.count()).toBe(0)
    await target.delete()
  })

  it('skips duplicate ideas on repeated import', async () => {
    const source = new InspirationDatabase(`source-${randomUUID()}`); const target = new InspirationDatabase(`target-${randomUUID()}`)
    await source.ideas.add({ id: 'same', title: '重复', body: '内容', status: 'inbox', favorite: false, tagIds: [], createdAt: '', updatedAt: '' })
    const backup = await exportBackup(source)
    expect(await importBackup(backup, target)).toMatchObject({ imported: 1, skipped: 0 })
    expect(await importBackup(backup, target)).toMatchObject({ imported: 0, skipped: 1 })
    expect(await target.ideas.count()).toBe(1)
    await source.delete(); await target.delete()
  })
})
