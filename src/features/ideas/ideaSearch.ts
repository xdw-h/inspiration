import type { IdeaStatus } from './types'

export interface SearchableIdea {
  id: string; title: string; body: string; transcript: string; favorite: boolean
  status: IdeaStatus; tagIds: string[]; hasAudio: boolean
}
export interface IdeaFilters { query: string; tagId: string; status: IdeaStatus | ''; favoriteOnly: boolean; type: 'text' | 'voice' | '' }

export function filterIdeas<T extends SearchableIdea>(ideas: T[], filters: IdeaFilters) {
  const query = filters.query.trim().toLocaleLowerCase('zh-CN')
  return ideas.filter((idea) => {
    const matchesQuery = !query || `${idea.title}\n${idea.body}\n${idea.transcript}`.toLocaleLowerCase('zh-CN').includes(query)
    const matchesTag = !filters.tagId || idea.tagIds.includes(filters.tagId)
    const matchesStatus = !filters.status || idea.status === filters.status
    const matchesFavorite = !filters.favoriteOnly || idea.favorite
    const matchesType = !filters.type || (filters.type === 'voice' ? idea.hasAudio : !idea.hasAudio)
    return matchesQuery && matchesTag && matchesStatus && matchesFavorite && matchesType
  })
}
