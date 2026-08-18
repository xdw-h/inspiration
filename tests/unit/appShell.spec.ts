import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import App from '../../src/App.vue'

describe('app shell', () => {
  it('shows five symmetric destinations on a curved navigation panel', async () => {
    const page = { template: '<main>页面</main>' }
    const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: '/', component: { template: '<main>灵感</main>' } },
      { path: '/timeline', component: page },
      { path: '/tags', component: page },
      { path: '/idea/new', component: page },
      { path: '/settings', component: page },
    ] })
    await router.push('/')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('灵感')
    expect(wrapper.text()).toContain('时间轴')
    expect(wrapper.text()).toContain('标签')
    expect(wrapper.text()).toContain('设置')
    expect(wrapper.get('[aria-label="新增灵感"]')).toBeTruthy()
    expect(wrapper.findAll('.bottom-nav > a')).toHaveLength(5)
    expect(wrapper.get('.bottom-nav__outline path').attributes('d')).toContain('C180 60')
  })
})
