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

  it('creates an idea with voice assets and clears the draft atomically', async () => {
    const repository = createLocalContentRepository(database)
    await repository.saveDraft({ title: '草稿', body: '', audioChunks: [new Blob(['part'])] })
    const idea = await repository.createIdeaWithAssets(
      { title: '语音灵感', body: '', status: 'inbox', favorite: false, tagIds: [] },
      { id: 'a1', blob: new Blob(['audio']), mimeType: 'audio/webm', size: 5, durationMs: 100, createdAt: '2026-08-18T00:00:00Z' },
      { id: 't1', text: '转写内容', status: 'completed', manuallyEdited: false, updatedAt: '2026-08-18T00:00:00Z' },
    )
    expect(await database.ideas.get(idea.id)).toBeTruthy()
    expect((await repository.getAssets(idea.id)).audio?.id).toBe('a1')
    expect(await repository.getDraft()).toBeUndefined()
  })

  it('rolls back the idea and keeps the draft when a voice asset fails', async () => {
    const repository = createLocalContentRepository(database)
    await database.audioAssets.add({ id: 'duplicate', ideaId: 'old', blob: new Blob(['old']), mimeType: 'audio/webm', size: 3, durationMs: 1, createdAt: '2026-08-18T00:00:00Z' })
    await repository.saveDraft({ title: '草稿', body: '', audioChunks: [new Blob(['part'])] })
    await expect(repository.createIdeaWithAssets(
      { title: '不应提交', body: '', status: 'inbox', favorite: false, tagIds: [] },
      { id: 'duplicate', blob: new Blob(['new']), mimeType: 'audio/webm', size: 3, durationMs: 1, createdAt: '2026-08-18T00:00:00Z' },
      undefined,
    )).rejects.toBeTruthy()
    expect(await database.ideas.count()).toBe(0)
    expect(await repository.getDraft()).toBeTruthy()
  })
})
