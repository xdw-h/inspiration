import type { InspirationDatabase } from '../../shared/db/database'
import { createId } from '../../shared/id/createId'
import type { IdeaDraft, IdeaEntity } from './types'

let lastTimestamp = 0
function nowIso() {
  const timestamp = Math.max(Date.now(), lastTimestamp + 1)
  lastTimestamp = timestamp
  return new Date(timestamp).toISOString()
}

export function createIdeaRepository(database: InspirationDatabase) {
  return {
    async create(draft: IdeaDraft): Promise<IdeaEntity> {
      const now = nowIso()
      const idea: IdeaEntity = { ...draft, tagIds: [...draft.tagIds], id: createId(), createdAt: now, updatedAt: now }
      await database.ideas.add(idea)
      return idea
    },
    get(id: string) { return database.ideas.get(id) },
    async list() { return database.ideas.orderBy('updatedAt').reverse().toArray() },
    async update(id: string, changes: Partial<IdeaDraft>) {
      const current = await database.ideas.get(id)
      if (!current) throw new Error('灵感不存在')
      const updated: IdeaEntity = { ...current, ...changes, id, tagIds: changes.tagIds ? [...changes.tagIds] : current.tagIds, createdAt: current.createdAt, updatedAt: nowIso() }
      await database.ideas.put(updated)
      return updated
    },
    async remove(id: string) {
      await database.transaction('rw', database.ideas, database.audioAssets, database.transcripts, async () => {
        await database.audioAssets.where('ideaId').equals(id).delete()
        await database.transcripts.where('ideaId').equals(id).delete()
        await database.ideas.delete(id)
      })
    },
    async search(query: string) {
      const keyword = query.trim().toLocaleLowerCase('zh-CN')
      const ideas = await database.ideas.toArray()
      if (!keyword) return ideas.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      const transcripts = await database.transcripts.toArray()
      const textByIdea = new Map(transcripts.map((item) => [item.ideaId, item.text]))
      return ideas.filter((idea) => `${idea.title}\n${idea.body}\n${textByIdea.get(idea.id) ?? ''}`.toLocaleLowerCase('zh-CN').includes(keyword))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },
  }
}
