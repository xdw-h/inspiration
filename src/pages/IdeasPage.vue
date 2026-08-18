<script setup lang="ts">
import { onActivated, onMounted, ref } from 'vue'
import { createIdeaRepository } from '../features/ideas/ideaRepository'
import type { IdeaEntity } from '../features/ideas/types'
import { db } from '../shared/db/database'
import { formatDateTimeMinute } from '../shared/format/date'

const repository = createIdeaRepository(db)
const ideas = ref<IdeaEntity[]>([])
const query = ref('')
async function load() { ideas.value = query.value ? await repository.search(query.value) : await repository.list() }
onMounted(load); onActivated(load)
</script>
<template><main class="page ideas-page"><header><div><h1>灵感</h1><p>随手记下每一个闪光时刻。</p></div><span>{{ ideas.length }}</span></header><input v-model="query" class="search" aria-label="搜索灵感" placeholder="搜索标题或内容" @input="load" /><section v-if="ideas.length" class="idea-list"><RouterLink v-for="idea in ideas" :key="idea.id" :to="`/idea/${idea.id}`"><small>{{ idea.favorite ? '★ ' : '' }}{{ idea.status === 'inbox' ? '待整理' : idea.status === 'active' ? '进行中' : idea.status === 'done' ? '已完成' : '已归档' }}</small><h2>{{ idea.title || idea.body.slice(0, 24) }}</h2><p>{{ idea.body }}</p><time>{{ formatDateTimeMinute(idea.updatedAt) }}</time></RouterLink></section><section v-else class="empty"><strong>还没有灵感</strong><p>从一段文字开始记录。</p><RouterLink to="/idea/new">记录第一条灵感</RouterLink></section></main></template>
<style scoped>.ideas-page{display:grid;gap:16px}.ideas-page>header{display:flex;justify-content:space-between;align-items:center}.ideas-page h1,.ideas-page p{margin:0}.ideas-page header p{margin-top:4px;color:#928882;font-size:12px}.ideas-page header span{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:#fff0eb;color:var(--primary);font-weight:700}.search{min-height:44px;padding:0 14px;border:1px solid #eaded7;border-radius:14px;background:#fff;font:inherit}.idea-list{display:grid;gap:12px}.idea-list>a{padding:16px;display:grid;gap:7px;border:1px solid #eee2da;border-radius:18px;background:#fff;box-shadow:0 8px 24px rgba(87,57,39,.06)}.idea-list h2{margin:0;font-size:17px}.idea-list p{overflow:hidden;color:#655d59;font-size:13px;white-space:nowrap;text-overflow:ellipsis}.idea-list small,.idea-list time{color:#9a918c;font-size:11px}.empty{padding:48px 20px;display:grid;justify-items:center;gap:9px;text-align:center}.empty a{margin-top:8px;padding:12px 16px;border-radius:13px;background:var(--primary);color:white}</style>
