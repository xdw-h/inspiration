import Dexie, { type EntityTable } from 'dexie'
import type { AudioAssetEntity, DraftEntity, IdeaEntity, TagEntity, TranscriptEntity } from '../../features/ideas/types'

export class InspirationDatabase extends Dexie {
  ideas!: EntityTable<IdeaEntity, 'id'>
  audioAssets!: EntityTable<AudioAssetEntity, 'id'>
  transcripts!: EntityTable<TranscriptEntity, 'id'>
  tags!: EntityTable<TagEntity, 'id'>
  drafts!: EntityTable<DraftEntity, 'id'>

  constructor(name = 'local-inspiration') {
    super(name)
    this.version(1).stores({
      ideas: 'id, status, favorite, createdAt, updatedAt, *tagIds',
      audioAssets: 'id, ideaId, createdAt',
      transcripts: 'id, &ideaId, status, updatedAt',
      tags: 'id, &name, order',
      drafts: 'id, updatedAt',
    })
  }
}

export const db = new InspirationDatabase()
