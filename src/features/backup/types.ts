import type { IdeaEntity, TagEntity, TranscriptEntity } from '../ideas/types'
export interface BackupManifest { version: 1; createdAt: string; ideas: number; audio: number }
export interface AudioMetadata { id: string; ideaId: string; mimeType: string; size: number; durationMs: number; createdAt: string; file: string }
export interface BackupData { ideas: IdeaEntity[]; tags: TagEntity[]; transcripts: TranscriptEntity[]; audio: AudioMetadata[] }
