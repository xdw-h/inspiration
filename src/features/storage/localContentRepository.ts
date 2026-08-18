import type { InspirationDatabase } from '../../shared/db/database'
import type { AudioAssetEntity, IdeaDraft, TranscriptEntity, TranscriptStatus } from '../ideas/types'
import { createId } from '../../shared/id/createId'

export function createLocalContentRepository(database: InspirationDatabase) {
  return {
    getDraft() { return database.drafts.get('current') },
    saveDraft(value: { title: string; body: string; audioChunks: Blob[] }) { return database.drafts.put({ id: 'current', ...value, audioChunks: [...value.audioChunks], updatedAt: new Date().toISOString() }) },
    async appendDraftChunk(chunk: Blob) { const draft = await database.drafts.get('current'); await database.drafts.put({ id: 'current', title: draft?.title ?? '', body: draft?.body ?? '', audioChunks: [...(draft?.audioChunks ?? []), chunk], updatedAt: new Date().toISOString() }) },
    async clearDraftAudio() { const draft = await database.drafts.get('current'); if (draft) await database.drafts.put({ ...draft, audioChunks: [], updatedAt: new Date().toISOString() }) },
    clearDraft() { return database.drafts.delete('current') },
    async createIdeaWithAssets(draft: IdeaDraft, audio: Omit<AudioAssetEntity, 'ideaId'> | undefined, transcript: { id: string; text: string; status: TranscriptStatus; manuallyEdited: boolean; updatedAt: string } | undefined) {
      const now = new Date().toISOString()
      const idea = { ...draft, tagIds: [...draft.tagIds], id: createId(), createdAt: now, updatedAt: now }
      await database.transaction('rw', database.ideas, database.audioAssets, database.transcripts, database.drafts, async () => {
        await database.ideas.add(idea)
        if (audio) await database.audioAssets.add({ ...audio, ideaId: idea.id })
        if (transcript) await database.transcripts.add({ ...transcript, ideaId: idea.id })
        await database.drafts.delete('current')
      })
      return idea
    },
    async getAssets(ideaId: string) { const [audio, transcript] = await Promise.all([database.audioAssets.where('ideaId').equals(ideaId).first(), database.transcripts.where('ideaId').equals(ideaId).first()]); return { audio, transcript } },
    updateTranscript(transcript: TranscriptEntity) { return database.transcripts.put(transcript) },
    async getBrowseData() { const [transcripts, audioIdeaIds, tags] = await Promise.all([database.transcripts.toArray(), database.audioAssets.orderBy('ideaId').uniqueKeys(), database.tags.orderBy('order').toArray()]); return { transcriptByIdea: new Map(transcripts.map((item) => [item.ideaId, item.text])), audioIdeaIds: new Set(audioIdeaIds.map(String)), tags } },
    countIdeasByTag(tagId: string) { return database.ideas.where('tagIds').equals(tagId).count() },
    async clearAll() { await database.transaction('rw', database.ideas, database.tags, database.transcripts, database.audioAssets, database.drafts, async () => { await Promise.all([database.ideas.clear(), database.tags.clear(), database.transcripts.clear(), database.audioAssets.clear(), database.drafts.clear()]) }) },
  }
}
