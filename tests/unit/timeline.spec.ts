import { describe, expect, it } from 'vitest'
import { groupIdeasByDate } from '../../src/features/ideas/timeline'
import type { IdeaEntity } from '../../src/features/ideas/types'

const idea = (id: string, createdAt: string): IdeaEntity => ({ id, createdAt, updatedAt: createdAt, title: id, body: '', status: 'inbox', favorite: false, tagIds: [] })

describe('idea timeline', () => {
  it('groups ideas by local date and sorts newest entries first', () => {
    const groups = groupIdeasByDate([
      idea('morning', '2026-08-17 08:30:00'),
      idea('latest', '2026-08-18 16:20:00'),
      idea('earlier', '2026-08-18 09:10:00'),
    ])
    expect(groups.map((group) => group.date)).toEqual(['2026-08-18', '2026-08-17'])
    expect(groups[0].ideas.map((item) => item.id)).toEqual(['latest', 'earlier'])
  })
})
