import { describe, expect, it, vi } from 'vitest'
import { createPwaUpdateService } from '../../src/features/pwa/pwaUpdate'

describe('PWA update service', () => {
  it('reports an already waiting worker', async () => {
    const onUpdate = vi.fn(); const waiting = { postMessage: vi.fn() }
    const registration = { waiting, addEventListener: vi.fn() }
    const service = createPwaUpdateService(async () => registration as never, onUpdate)
    await service.start()
    expect(onUpdate).toHaveBeenCalledWith(waiting)
  })
})
