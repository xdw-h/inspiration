import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'
import './styles/base.css'

createApp(App).use(createPinia()).use(router).mount('#app')

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
})
