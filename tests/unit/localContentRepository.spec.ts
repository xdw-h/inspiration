import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createLocalContentRepository } from '../../src/features/storage/localContentRepository'
import { InspirationDatabase } from '../../src/shared/db/database'

describe('local content repository', () => {
  let database: InspirationDatabase
  beforeEach(() => { database = new InspirationDatabase(`content-${crypto.randomUUID()}`) })
  afterEach(async () => database.delete())

  it('persists text and audio draft chunks', async () => {
    const repository = createLocalContentRepository(database)
    await repository.saveDraft({ title: '标题', body: '正文', audioChunks: [new Blob(['part'])] })
    const draft = await repository.getDraft()
    expect(draft?.title).toBe('标题')
    expect(draft?.audioChunks).toHaveLength(1)
  })

  it('returns browse data with transcript and audio flags', async () => {
    const repository = createLocalContentRepository(database)
    await database.ideas.add({ id: 'i1', title: '语音', body: '', status: 'inbox', favorite: false, tagIds: [], createdAt: '2026-08-18T00:00:00Z', updatedAt: '2026-08-18T00:00:00Z' })
    await database.transcripts.add({ id: 't1', ideaId: 'i1', text: '转写', status: 'completed', manuallyEdited: false, updatedAt: '2026-08-18T00:00:00Z' })
    await database.audioAssets.add({ id: 'a1', ideaId: 'i1', blob: new Blob(['a']), mimeType: 'audio/webm', size: 1, durationMs: 100, createdAt: '2026-08-18T00:00:00Z' })
    const data = await repository.getBrowseData()
    expect(data.transcriptByIdea.get('i1')).toBe('转写')
    expect(data.audioIdeaIds.has('i1')).toBe(true)
  })
})
