import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTagRepository } from '../../src/features/tags/tagRepository'
import { InspirationDatabase } from '../../src/shared/db/database'

describe('tag repository', () => {
  let database: InspirationDatabase
  beforeEach(() => { database = new InspirationDatabase(`test-${crypto.randomUUID()}`) })
  afterEach(async () => database.delete())

  it('rejects duplicate normalized tag names', async () => {
    const repository = createTagRepository(database)
    await repository.create('产品', '#f47f70')
    await expect(repository.create(' 产品 ', '#ffffff')).rejects.toThrow('标签已存在')
  })

  it('removes tag references from ideas', async () => {
    const repository = createTagRepository(database)
    const tag = await repository.create('产品', '#f47f70')
    await database.ideas.add({ id: 'idea-1', title: '想法', body: '', status: 'inbox', favorite: false, tagIds: [tag.id], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    await repository.remove(tag.id)
    expect((await database.ideas.get('idea-1'))?.tagIds).toEqual([])
  })
})
