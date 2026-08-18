import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VoiceRecorder from '../../src/features/recorder/VoiceRecorder.vue'

describe('VoiceRecorder', () => {
  it('shows recording fallback when MediaRecorder is unavailable', () => {
    const wrapper = mount(VoiceRecorder, { props: { supported: false } })
    expect(wrapper.text()).toContain('当前浏览器不支持录音')
    expect(wrapper.find('[aria-label="开始录音"]').exists()).toBe(false)
  })
})
