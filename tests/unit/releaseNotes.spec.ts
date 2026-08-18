import { beforeEach, describe, expect, it } from 'vitest'
import { latestRelease, markLatestReleaseViewed, releaseNotes, shouldShowLatestRelease } from '../../src/features/releaseNotes/releaseNotes'

describe('release notes', () => {
  beforeEach(() => localStorage.clear())

  it('shows the latest release once per version', () => {
    expect(latestRelease.version).toBe('0.2.0')
    expect(shouldShowLatestRelease()).toBe(true)
    markLatestReleaseViewed()
    expect(shouldShowLatestRelease()).toBe(false)
  })

  it('keeps release history in newest-first order', () => {
    expect(releaseNotes.map((note) => note.version)).toEqual(['0.2.0', '0.1.0'])
    expect(releaseNotes[0].items.length).toBeGreaterThan(0)
  })
})
