import { defineStore } from 'pinia'
import type { IdeaStatus } from './types'

export const useIdeaFilterStore = defineStore('idea-filters', {
  state: () => ({ query: '', tagId: '', status: '' as IdeaStatus | '', type: '' as 'text' | 'voice' | '', favoriteOnly: false }),
  actions: { reset() { this.query = ''; this.tagId = ''; this.status = ''; this.type = ''; this.favoriteOnly = false } },
})
