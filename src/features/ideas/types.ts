export type IdeaStatus = 'inbox' | 'active' | 'done' | 'archived'
export type TranscriptStatus = 'not_supported' | 'idle' | 'listening' | 'completed' | 'failed'

export interface IdeaEntity {
  id: string
  title: string
  body: string
  status: IdeaStatus
  favorite: boolean
  tagIds: string[]
  createdAt: string
  updatedAt: string
}

export interface AudioAssetEntity {
  id: string
  ideaId: string
  blob: Blob
  mimeType: string
  size: number
  durationMs: number
  createdAt: string
}

export interface TranscriptEntity {
  id: string
  ideaId: string
  text: string
  status: TranscriptStatus
  manuallyEdited: boolean
  updatedAt: string
}

export interface TagEntity { id: string; name: string; color: string; order: number; createdAt: string }
export interface DraftEntity { id: 'current'; title: string; body: string; audioChunks: Blob[]; updatedAt: string }
export type IdeaDraft = Pick<IdeaEntity, 'title' | 'body' | 'status' | 'favorite' | 'tagIds'>
