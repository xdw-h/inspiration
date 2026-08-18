import { describe, expect, it } from 'vitest'
import { filterIdeas } from '../../src/features/ideas/ideaSearch'

describe('idea search', () => {
  const ideas = [{ id: '1', title: '产品', body: '', transcript: '语音内容', favorite: true, status: 'inbox' as const, tagIds: ['a'], hasAudio: true }]
  it('searches title, body and transcript', () => expect(filterIdeas(ideas, { query: '语音', tagId: '', status: '', favoriteOnly: false, type: '' })).toHaveLength(1))
  it('combines filters', () => expect(filterIdeas(ideas, { query: '', tagId: 'a', status: 'inbox', favoriteOnly: true, type: 'voice' })).toHaveLength(1))
  it('returns no items when one combined filter differs', () => expect(filterIdeas(ideas, { query: '', tagId: 'b', status: 'inbox', favoriteOnly: true, type: 'voice' })).toHaveLength(0))
})
