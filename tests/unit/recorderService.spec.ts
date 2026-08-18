import { describe, expect, it, vi } from 'vitest'
import { chooseAudioMimeType, createRecorderService } from '../../src/features/recorder/recorderService'

describe('recorder service', () => {
  it('chooses the first supported mobile audio type', () => {
    const supported = vi.fn((type: string) => type === 'audio/mp4')
    expect(chooseAudioMimeType(supported)).toBe('audio/mp4')
  })

  it('returns a clear permission error', async () => {
    const Recorder = { isTypeSupported: vi.fn(() => false) }
    const service = createRecorderService({ getUserMedia: vi.fn().mockRejectedValue(Object.assign(new Error(), { name: 'NotAllowedError' })) } as never, Recorder as never)
    await expect(service.start()).rejects.toThrow('麦克风权限被拒绝')
  })

  it('reports missing recording support', async () => {
    const service = createRecorderService({ getUserMedia: vi.fn() } as never, undefined)
    await expect(service.start()).rejects.toThrow('当前浏览器不支持录音')
  })
})
