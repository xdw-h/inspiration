<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AppLockScreen from './features/privacy/AppLockScreen.vue'
import { appUnlocked, lockApp } from './features/privacy/appLockStore'
import { applyPwaUpdate, pwaUpdateAvailable } from './features/pwa/pwaUpdate'

const route = useRoute()
const hideNav = computed(() => Boolean(route.meta.hideNav))
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') lockApp() })
</script>

<template>
  <div class="app-shell" :class="{ 'without-nav': hideNav }">
    <AppLockScreen v-if="!appUnlocked" />
    <RouterView v-else />
    <aside v-if="appUnlocked && pwaUpdateAvailable" class="update-toast" role="status"><span><strong>发现新版本</strong><small>更新后即可使用最新功能</small></span><button type="button" @click="applyPwaUpdate">立即更新</button></aside>
    <nav v-if="!hideNav" class="bottom-nav" aria-label="主导航">
      <svg class="bottom-nav__outline" viewBox="0 0 430 128" preserveAspectRatio="none" aria-hidden="true"><path d="M22 60 H163 C180 60 190 34 215 34 C240 34 250 60 267 60 H408 Q418 60 418 70 V111 Q418 121 408 121 H22 Q12 121 12 111 V70 Q12 60 22 60 Z" /></svg>
      <RouterLink to="/"><svg class="bottom-nav__icon" viewBox="0 0 24 24"><path d="M4 20V9l8-6 8 6v11H4Z"/><path d="M9 20v-6h6v6"/></svg><span>灵感</span></RouterLink>
      <RouterLink to="/timeline"><svg class="bottom-nav__icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg><span>时间轴</span></RouterLink>
      <RouterLink class="capture-action" to="/idea/new" aria-label="新增灵感"><svg viewBox="0 0 32 32"><path d="M16 5v22M5 16h22"/></svg></RouterLink>
      <RouterLink to="/tags"><svg class="bottom-nav__icon" viewBox="0 0 24 24"><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.5"/></svg><span>标签</span></RouterLink>
      <RouterLink to="/settings"><svg class="bottom-nav__icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="m19 13 2 1-2 4-2-1.2-2 1L14 21h-4l-1-3.2-2-1L5 18l-2-4 2-1v-2L3 10l2-4 2 1.2 2-1L10 3h4l1 3.2 2 1L19 6l2 4-2 1v2Z"/></svg><span>设置</span></RouterLink>
    </nav>
  </div>
</template>
<style scoped>.update-toast{position:fixed;z-index:80;right:16px;bottom:calc(82px + var(--safe-bottom));left:16px;width:min(calc(100% - 32px),398px);margin:auto;padding:11px 12px;display:flex;align-items:center;justify-content:space-between;border:1px solid #eaded7;border-radius:15px;background:#fff;box-shadow:0 12px 35px rgba(87,57,39,.16)}.update-toast span{display:grid}.update-toast small{color:#8f8580;font-size:10px}.update-toast button{min-height:38px;padding:0 12px;border:0;border-radius:10px;background:var(--primary);color:#fff}</style>
