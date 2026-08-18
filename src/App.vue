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
      <RouterLink to="/">灵感</RouterLink>
      <RouterLink to="/tags">标签</RouterLink>
      <RouterLink class="capture-action" to="/idea/new" aria-label="新增灵感">＋</RouterLink>
      <RouterLink to="/settings">设置</RouterLink>
    </nav>
  </div>
</template>
<style scoped>.update-toast{position:fixed;z-index:80;right:16px;bottom:calc(82px + var(--safe-bottom));left:16px;width:min(calc(100% - 32px),398px);margin:auto;padding:11px 12px;display:flex;align-items:center;justify-content:space-between;border:1px solid #eaded7;border-radius:15px;background:#fff;box-shadow:0 12px 35px rgba(87,57,39,.16)}.update-toast span{display:grid}.update-toast small{color:#8f8580;font-size:10px}.update-toast button{min-height:38px;padding:0 12px;border:0;border-radius:10px;background:var(--primary);color:#fff}</style>
