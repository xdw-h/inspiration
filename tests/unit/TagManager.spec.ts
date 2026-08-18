import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TagManager from '../../src/features/tags/TagManager.vue'

describe('TagManager', () => {
  it('trims and emits a valid new tag', async () => {
    const wrapper = mount(TagManager, { props: { tags: [] } })
    await wrapper.get('[aria-label="标签名称"]').setValue('  产品  ')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('create')?.[0]?.[0]).toBe('产品')
  })
  it('rejects a duplicate tag name', async () => {
    const wrapper = mount(TagManager, { props: { tags: [{ id: '1', name: '产品', color: '#f47f70', order: 0, createdAt: '2026-08-18T00:00:00Z' }] } })
    await wrapper.get('[aria-label="标签名称"]').setValue('产品')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('[role="alert"]').text()).toContain('标签已存在')
  })
})
