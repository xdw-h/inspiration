import { formatDate } from '../../shared/format/date'
import type { IdeaEntity } from './types'

export interface TimelineGroup { date: string; ideas: IdeaEntity[] }

export function groupIdeasByDate(ideas: IdeaEntity[]): TimelineGroup[] {
  const groups = new Map<string, IdeaEntity[]>()
  for (const idea of [...ideas].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const date = formatDate(idea.createdAt)
    groups.set(date, [...(groups.get(date) ?? []), idea])
  }
  return [...groups].map(([date, items]) => ({ date, ideas: items }))
}
