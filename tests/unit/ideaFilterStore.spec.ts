import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useIdeaFilterStore } from '../../src/features/ideas/ideaFilterStore'

describe('idea filter store', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('keeps combined filters until explicitly reset', () => {
    const store = useIdeaFilterStore()
    store.query = '语音'; store.type = 'voice'; store.favoriteOnly = true
    expect(useIdeaFilterStore().query).toBe('语音')
    store.reset()
    expect(store.$state).toMatchObject({ query: '', type: '', favoriteOnly: false })
  })
})
