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

  it('reports an unexpected browser interruption', async () => {
    let instance: FakeRecorder | undefined
    class FakeRecorder extends EventTarget {
      static isTypeSupported() { return true }
      state: RecordingState = 'inactive'; mimeType = 'audio/webm'
      constructor() { super(); instance = this }
      start() { this.state = 'recording' }
      pause() { this.state = 'paused' }
      resume() { this.state = 'recording' }
      stop() { this.state = 'inactive'; this.dispatchEvent(new Event('stop')) }
    }
    const interrupted = vi.fn()
    const devices = { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) }
    const service = createRecorderService(devices as never, FakeRecorder as never, undefined, { onInterrupted: interrupted })
    await service.start()
    instance!.stop()
    expect(interrupted).toHaveBeenCalledOnce()
  })
})
