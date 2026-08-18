import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime } from '../../src/shared/format/date'

describe('date formatting', () => {
  it('formats ISO, zoned, database and empty values safely', () => {
    expect(formatDate('2026-08-05')).toBe('2026-08-05')
    expect(formatDateTime('2026-08-05 08:23:10')).toBe('2026-08-05 08:23:10')
    expect(formatDateTime('2026-08-05T08:23:10.000+00:00')).not.toMatch(/[TZ]|\.000|\+00:00/)
    expect(formatDateTime(null)).toBe('-')
    expect(formatDateTime('bad')).toBe('-')
  })
})
