import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TranscriptEditor from '../../src/features/transcription/TranscriptEditor.vue'

describe('TranscriptEditor', () => {
  it('shows the agreed unsupported fallback', () => {
    const wrapper = mount(TranscriptEditor, { props: { status: 'not_supported', text: '' } })
    expect(wrapper.text()).toContain('当前浏览器不支持自动转写，录音仍会正常保存')
  })

  it('marks edited transcript as manual', async () => {
    const wrapper = mount(TranscriptEditor, { props: { status: 'completed', text: '机器文本' } })
    await wrapper.get('textarea').setValue('人工修正')
    expect(wrapper.emitted('update')?.[0]).toEqual(['人工修正', true])
  })
})
