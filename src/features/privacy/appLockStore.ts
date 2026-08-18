import { ref } from 'vue'

const HASH_KEY = 'inspiration-lock-hash'; const SALT_KEY = 'inspiration-lock-salt'
type Hasher = (value: string) => Promise<string>
async function sha256(value: string) { const bytes = new TextEncoder().encode(value); const digest = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, '0')).join('') }

export function createAppLockStore(storage: Storage, hasher: Hasher = sha256) {
  return {
    configured: () => Boolean(storage.getItem(HASH_KEY) && storage.getItem(SALT_KEY)),
    async setup(pin: string) { if (!/^\d{6}$/u.test(pin)) throw new Error('请输入 6 位数字密码'); const salt = crypto.randomUUID(); storage.setItem(SALT_KEY, salt); storage.setItem(HASH_KEY, await hasher(`${salt}:${pin}`)) },
    async verify(pin: string) { const salt = storage.getItem(SALT_KEY); const expected = storage.getItem(HASH_KEY); return Boolean(salt && expected && await hasher(`${salt}:${pin}`) === expected) },
    clear() { storage.removeItem(HASH_KEY); storage.removeItem(SALT_KEY) },
  }
}

export const appLock = createAppLockStore(localStorage)
export const appUnlocked = ref(!appLock.configured())
export function lockApp() { if (appLock.configured()) appUnlocked.value = false }
