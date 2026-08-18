import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('PWA assets', () => {
  it('declares standalone display and offline navigation fallback', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'))
    const worker = readFileSync('public/sw.js', 'utf8')
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('./')
    expect(worker).toContain("event.request.mode === 'navigate'")
    expect(worker).toContain("caches.match(`${BASE}index.html`)")
    expect(worker).toContain('__BUILD_VERSION__')
    expect(worker).toContain('inspiration-shell-${BUILD_VERSION}')
  })
})
