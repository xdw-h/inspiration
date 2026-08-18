export interface StorageProtectionStatus { supported: boolean; persisted: boolean; usage: number | null; quota: number | null; error?: string }
export interface StorageManagerLike { estimate(): Promise<{ usage?: number; quota?: number }>; persisted(): Promise<boolean>; persist?: () => Promise<boolean> }

function browserStorage(): StorageManagerLike | undefined {
  if (typeof navigator === 'undefined') return undefined
  const storage = navigator.storage as StorageManagerLike | undefined
  return storage && typeof storage.estimate === 'function' && typeof storage.persisted === 'function' ? storage : undefined
}
export function formatBytes(value: number | null) {
  if (value === null || !Number.isFinite(value) || value < 0) return '-'
  const units = ['B', 'KB', 'MB', 'GB']; let amount = value; let index = 0
  while (amount >= 1024 && index < units.length - 1) { amount /= 1024; index += 1 }
  return `${Number(amount.toFixed(1))} ${units[index]}`
}
export async function getStorageProtectionStatus(storage: StorageManagerLike | undefined = browserStorage()): Promise<StorageProtectionStatus> {
  if (!storage) return { supported: false, persisted: false, usage: null, quota: null }
  try { const [estimate, persisted] = await Promise.all([storage.estimate(), storage.persisted()]); return { supported: true, persisted, usage: estimate.usage ?? null, quota: estimate.quota ?? null } }
  catch { return { supported: true, persisted: false, usage: null, quota: null, error: '无法读取浏览器存储状态' } }
}
export async function requestStorageProtection(storage: StorageManagerLike | undefined = browserStorage()): Promise<StorageProtectionStatus> {
  if (!storage) return { supported: false, persisted: false, usage: null, quota: null }
  if (!storage.persist) return getStorageProtectionStatus(storage)
  try { await storage.persist(); return getStorageProtectionStatus(storage) }
  catch { return { supported: true, persisted: false, usage: null, quota: null, error: '存储保护申请失败，请稍后重试' } }
}
