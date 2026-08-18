import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import VoiceRecorder from '../../src/features/recorder/VoiceRecorder.vue'

describe('VoiceRecorder', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows recording fallback when MediaRecorder is unavailable', () => {
    const wrapper = mount(VoiceRecorder, { props: { supported: false } })
    expect(wrapper.text()).toContain('当前浏览器不支持录音')
    expect(wrapper.find('[aria-label="开始录音"]').exists()).toBe(false)
  })

  it('keeps pause and finish controls in a mobile recording dock', async () => {
    class FakeMediaRecorder extends EventTarget {
      static isTypeSupported() { return true }
      state: RecordingState = 'inactive'
      mimeType = 'audio/webm'
      start() { this.state = 'recording' }
      pause() { this.state = 'paused' }
      resume() { this.state = 'recording' }
      stop() { this.state = 'inactive'; this.dispatchEvent(new Event('stop')) }
    }
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) },
    })

    const wrapper = mount(VoiceRecorder)
    await wrapper.get('[aria-label="开始录音"]').trigger('click')
    await vi.waitFor(() => expect(wrapper.get('.recorder-actions').classes()).toContain('recording-dock'))

    expect(wrapper.get('[aria-label="暂停录音"]').isVisible()).toBe(true)
    expect(wrapper.get('[aria-label="结束录音"]').isVisible()).toBe(true)
    await wrapper.get('[aria-label="暂停录音"]').trigger('click')
    expect(wrapper.find('[aria-label="继续录音"]').exists()).toBe(true)
  })
})
