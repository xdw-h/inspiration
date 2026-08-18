<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { releaseNotes } from './releaseNotes'
defineEmits<{ close: [] }>()
let previousOverflow = ''
onMounted(() => { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden' })
onBeforeUnmount(() => { document.body.style.overflow = previousOverflow })
</script>

<template>
  <Teleport to="body"><div class="notes-overlay" @click.self="$emit('close')"><section class="notes-sheet" role="dialog" aria-modal="true" aria-label="版本公告">
    <header><div><strong>版本公告</strong><small>每一次更新，都有迹可循</small></div><button type="button" aria-label="关闭版本公告" @click="$emit('close')">×</button></header>
    <div class="notes-list"><article v-for="(note, index) in releaseNotes" :key="note.version" :class="{ latest: index === 0 }"><div class="version-row"><b>v{{ note.version }}</b><time :datetime="note.date">{{ note.date }}</time><em v-if="index === 0">最新</em></div><h2>{{ note.title }}</h2><ul><li v-for="item in note.items" :key="item">{{ item }}</li></ul></article></div>
  </section></div></Teleport>
</template>

<style scoped>
.notes-overlay{position:fixed;z-index:150;inset:0;display:flex;align-items:flex-end;background:rgba(43,35,31,.42);backdrop-filter:blur(4px)}.notes-sheet{width:min(100%,430px);max-height:82dvh;margin:0 auto;padding:20px 18px calc(22px + var(--safe-bottom));display:grid;grid-template-rows:auto minmax(0,1fr);gap:16px;overflow:hidden;border-radius:28px 28px 0 0;background:#fffaf7;box-shadow:0 -18px 48px rgba(72,45,32,.18)}header{display:flex;align-items:center;justify-content:space-between}header div{display:grid;gap:3px}header strong{font-size:20px}header small{color:#928882;font-size:10px}header button{width:36px;height:36px;border:0;border-radius:50%;background:#fff0eb;color:#8f837d;font-size:22px}.notes-list{min-height:0;display:grid;gap:12px;overflow-y:auto;overscroll-behavior:contain}.notes-list article{padding:15px;border:1px solid #eee2da;border-radius:17px;background:#fff}.notes-list article.latest{border-color:#f6b1a8;background:#fff7f4}.version-row{display:flex;align-items:center;gap:8px}.version-row b{color:var(--primary);font-size:12px}.version-row time{color:#9a918c;font-size:10px}.version-row em{margin-left:auto;padding:3px 7px;border-radius:999px;background:var(--primary);color:#fff;font-size:9px;font-style:normal}.notes-list h2{margin:9px 0 7px;font-size:15px}.notes-list ul{margin:0;padding-left:18px;color:#6f6661;font-size:12px;line-height:1.7}
</style>
