import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InspirationDatabase } from '../../src/shared/db/database'
import { createIdeaRepository } from '../../src/features/ideas/ideaRepository'

describe('idea repository', () => {
  let database: InspirationDatabase
  beforeEach(() => { database = new InspirationDatabase(`test-${crypto.randomUUID()}`) })
  afterEach(async () => database.delete())

  it('creates and lists newest ideas without loading audio blobs', async () => {
    const repository = createIdeaRepository(database)
    const first = await repository.create({ title: '旧', body: '内容', status: 'inbox', favorite: false, tagIds: [] })
    const second = await repository.create({ title: '新', body: '内容', status: 'inbox', favorite: true, tagIds: [] })
    const items = await repository.list()
    expect(items.map((item) => item.id)).toEqual([second.id, first.id])
    expect('blob' in items[0]).toBe(false)
  })

  it('deletes linked audio and transcript transactionally', async () => {
    const repository = createIdeaRepository(database)
    const idea = await repository.create({ title: '语音', body: '', status: 'inbox', favorite: false, tagIds: [] })
    await database.audioAssets.add({ id: 'audio-1', ideaId: idea.id, blob: new Blob(['voice']), mimeType: 'audio/webm', size: 5, durationMs: 1000, createdAt: new Date().toISOString() })
    await database.transcripts.add({ id: 'transcript-1', ideaId: idea.id, text: '你好', status: 'completed', manuallyEdited: false, updatedAt: new Date().toISOString() })
    await repository.remove(idea.id)
    expect(await database.audioAssets.where('ideaId').equals(idea.id).count()).toBe(0)
    expect(await database.transcripts.where('ideaId').equals(idea.id).count()).toBe(0)
  })
})
