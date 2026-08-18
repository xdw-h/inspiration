import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import ReleaseNotesSheet from '../../src/features/releaseNotes/ReleaseNotesSheet.vue'

describe('ReleaseNotesSheet', () => {
  it('renders version history and closes explicitly', async () => {
    const wrapper = mount(ReleaseNotesSheet, { attachTo: document.body })
    expect(document.body.textContent).toContain('版本公告')
    expect(document.body.textContent).toContain('v0.2.0')
    document.querySelector<HTMLButtonElement>('[aria-label="关闭版本公告"]')!.click()
    await nextTick()
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })
})
