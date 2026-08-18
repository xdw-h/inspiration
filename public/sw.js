const CACHE = 'inspiration-shell-v1'
const BASE = new URL('./', self.registration.scope).pathname
const SHELL = [BASE, `${BASE}index.html`, `${BASE}manifest.webmanifest`, `${BASE}icon.svg`]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    await cache.addAll(SHELL)
    const response = await fetch(`${BASE}.vite/manifest.json`)
    const manifest = await response.json()
    const assets = Object.values(manifest).flatMap((entry) => [entry.file, ...(entry.css ?? []), ...(entry.assets ?? [])]).map((file) => `${BASE}${file}`)
    await cache.addAll([...new Set(assets)])
  }))
})

self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting() })

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(`${BASE}index.html`)))
    return
  }
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached ?? fetch(event.request)))
})
