import { ref } from 'vue'

type Register = () => Promise<ServiceWorkerRegistration>
export function createPwaUpdateService(register: Register, onUpdate: (worker: ServiceWorker) => void) {
  return { async start() { const registration = await register(); if (registration.waiting) onUpdate(registration.waiting); registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) onUpdate(worker) }) }) } }
}
export const pwaUpdateAvailable = ref(false)
let waitingWorker: ServiceWorker | null = null
export async function startPwaUpdates() {
  if (!('serviceWorker' in navigator)) return
  const service = createPwaUpdateService(() => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`), (worker) => { waitingWorker = worker; pwaUpdateAvailable.value = true })
  await service.start()
}
export function applyPwaUpdate() { if (!waitingWorker) return; waitingWorker.postMessage({ type: 'SKIP_WAITING' }); navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true }) }
