function pad(value: number) { return String(value).padStart(2, '0') }

function parseLocal(value: string): Date | null {
  const database = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/u.exec(value)
  if (database && !value.includes('T')) {
    const date = new Date(Number(database[1]), Number(database[2]) - 1, Number(database[3]), Number(database[4] ?? 0), Number(database[5] ?? 0), Number(database[6] ?? 0))
    return Number.isNaN(date.getTime()) ? null : date
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value?: string | null) {
  if (!value) return '-'
  if (/^\d{4}-\d{2}-\d{2}$/u.test(value)) return value
  const date = parseLocal(value)
  return date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : '-'
}

export function formatDateTime(value?: string | null) {
  if (!value) return '-'
  const date = parseLocal(value)
  return date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` : '-'
}

export function formatDateTimeMinute(value?: string | null) {
  const formatted = formatDateTime(value)
  return formatted === '-' ? formatted : formatted.slice(0, 16)
}
