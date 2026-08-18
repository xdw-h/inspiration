import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IdeaForm from '../../src/features/ideas/IdeaForm.vue'

describe('IdeaForm', () => {
  it('emits trimmed text content', async () => {
    const wrapper = mount(IdeaForm)
    await wrapper.get('[aria-label="灵感正文"]').setValue('  一个想法  ')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({ body: '一个想法', status: 'inbox', favorite: false })
  })

  it('does not save an empty idea', async () => {
    const wrapper = mount(IdeaForm)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.get('[role="alert"]').text()).toContain('请输入灵感内容')
  })
})
