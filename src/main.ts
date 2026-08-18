import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'
import './styles/base.css'
import { startPwaUpdates } from './features/pwa/pwaUpdate'

createApp(App).use(createPinia()).use(router).mount('#app')

window.addEventListener('load', () => void startPwaUpdates())
