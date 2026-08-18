<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const hideNav = computed(() => Boolean(route.meta.hideNav))
</script>

<template>
  <div class="app-shell" :class="{ 'without-nav': hideNav }">
    <RouterView />
    <nav v-if="!hideNav" class="bottom-nav" aria-label="主导航">
      <RouterLink to="/">灵感</RouterLink>
      <RouterLink to="/tags">标签</RouterLink>
      <RouterLink class="capture-action" to="/idea/new" aria-label="新增灵感">＋</RouterLink>
      <RouterLink to="/settings">设置</RouterLink>
    </nav>
  </div>
</template>
