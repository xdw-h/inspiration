import type { InspirationDatabase } from '../../shared/db/database'
import { createId } from '../../shared/id/createId'
import type { TagEntity } from '../ideas/types'

function normalizeName(value: string) {
  const name = value.trim()
  if (!name || name.length > 12) throw new Error('标签名称应为 1–12 个字符')
  return name
}

export function createTagRepository(database: InspirationDatabase) {
  async function assertUnique(name: string, excludedId?: string) {
    const normalized = name.toLocaleLowerCase('zh-CN')
    const duplicate = (await database.tags.toArray()).some((tag) => tag.id !== excludedId && tag.name.toLocaleLowerCase('zh-CN') === normalized)
    if (duplicate) throw new Error('标签已存在')
  }
  return {
    async create(value: string, color: string): Promise<TagEntity> {
      const name = normalizeName(value)
      await assertUnique(name)
      const tag: TagEntity = { id: createId(), name, color, order: await database.tags.count(), createdAt: new Date().toISOString() }
      await database.tags.add(tag)
      return tag
    },
    async list() { return database.tags.orderBy('order').toArray() },
    async rename(id: string, value: string) {
      const name = normalizeName(value)
      await assertUnique(name, id)
      const changed = await database.tags.update(id, { name })
      if (!changed) throw new Error('标签不存在')
    },
    async remove(id: string) {
      await database.transaction('rw', database.tags, database.ideas, async () => {
        await database.ideas.where('tagIds').equals(id).modify((idea) => { idea.tagIds = idea.tagIds.filter((tagId) => tagId !== id) })
        await database.tags.delete(id)
      })
    },
  }
}
