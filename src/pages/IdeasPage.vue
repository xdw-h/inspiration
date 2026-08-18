<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue'
import { createIdeaRepository } from '../features/ideas/ideaRepository'
import type { IdeaEntity } from '../features/ideas/types'
import { db } from '../shared/db/database'
import { formatDateTimeMinute } from '../shared/format/date'
import { filterIdeas, type SearchableIdea } from '../features/ideas/ideaSearch'
import type { IdeaStatus, TagEntity } from '../features/ideas/types'
import { createLocalContentRepository } from '../features/storage/localContentRepository'
import { storeToRefs } from 'pinia'
import { useIdeaFilterStore } from '../features/ideas/ideaFilterStore'

const repository = createIdeaRepository(db)
const contentRepository = createLocalContentRepository(db)
const ideas = ref<(IdeaEntity & SearchableIdea)[]>([])
const filterStore = useIdeaFilterStore(); const { query, tagId, status, type, favoriteOnly } = storeToRefs(filterStore)
const tags = ref<TagEntity[]>([])
const visibleIdeas = computed(() => filterIdeas(ideas.value, { query: query.value, tagId: tagId.value, status: status.value, type: type.value, favoriteOnly: favoriteOnly.value }))
async function load() { const [items, browse] = await Promise.all([repository.list(), contentRepository.getBrowseData()]); tags.value = browse.tags; ideas.value = items.map((item) => ({ ...item, transcript: browse.transcriptByIdea.get(item.id) ?? '', hasAudio: browse.audioIdeaIds.has(item.id) })) }
onMounted(load); onActivated(load)
</script>
<template><main class="page ideas-page"><header><div><h1>灵感</h1><p>随手记下每一个闪光时刻。</p></div><span>{{ visibleIdeas.length }}</span></header><input v-model="query" class="search" aria-label="搜索灵感" placeholder="搜索标题、正文或转写" /><div class="filters"><select v-model="type" aria-label="记录类型"><option value="">全部类型</option><option value="text">文字</option><option value="voice">语音</option></select><select v-model="status" aria-label="灵感状态"><option value="">全部状态</option><option value="inbox">待整理</option><option value="active">进行中</option><option value="done">已完成</option><option value="archived">已归档</option></select><select v-model="tagId" aria-label="标签筛选"><option value="">全部标签</option><option v-for="tag in tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option></select><label><input v-model="favoriteOnly" type="checkbox" /> 仅收藏</label></div><section v-if="visibleIdeas.length" class="idea-list"><RouterLink v-for="idea in visibleIdeas" :key="idea.id" :to="`/idea/${idea.id}`"><small>{{ idea.hasAudio ? '🎙 ' : '✎ ' }}{{ idea.favorite ? '★ ' : '' }}{{ idea.status === 'inbox' ? '待整理' : idea.status === 'active' ? '进行中' : idea.status === 'done' ? '已完成' : '已归档' }}</small><h2>{{ idea.title || idea.body.slice(0, 24) || idea.transcript.slice(0, 24) || '语音灵感' }}</h2><p>{{ idea.body || idea.transcript || '暂无文字内容' }}</p><time>{{ formatDateTimeMinute(idea.updatedAt) }}</time></RouterLink></section><section v-else class="empty"><strong>{{ ideas.length ? '没有匹配的灵感' : '还没有灵感' }}</strong><p>{{ ideas.length ? '尝试清空筛选条件。' : '从一段文字开始记录。' }}</p><RouterLink v-if="!ideas.length" to="/idea/new">记录第一条灵感</RouterLink></section></main></template>
<style scoped>.ideas-page{display:grid;gap:16px}.ideas-page>header{display:flex;justify-content:space-between;align-items:center}.ideas-page h1,.ideas-page p{margin:0}.ideas-page header p{margin-top:4px;color:#928882;font-size:12px}.ideas-page header span{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:#fff0eb;color:var(--primary);font-weight:700}.search{min-height:44px;padding:0 14px;border:1px solid #eaded7;border-radius:14px;background:#fff;font:inherit}.filters{display:flex;gap:7px;overflow-x:auto}.filters select,.filters label{min-height:36px;padding:0 9px;display:flex;align-items:center;flex:0 0 auto;border:1px solid #eaded7;border-radius:10px;background:#fff;color:#6f6661;font-size:11px}.idea-list{display:grid;gap:12px}.idea-list>a{padding:16px;display:grid;gap:7px;border:1px solid #eee2da;border-radius:18px;background:#fff;box-shadow:0 8px 24px rgba(87,57,39,.06)}.idea-list h2{margin:0;font-size:17px}.idea-list p{overflow:hidden;color:#655d59;font-size:13px;white-space:nowrap;text-overflow:ellipsis}.idea-list small,.idea-list time{color:#9a918c;font-size:11px}.empty{padding:48px 20px;display:grid;justify-items:center;gap:9px;text-align:center}.empty a{margin-top:8px;padding:12px 16px;border-radius:13px;background:var(--primary);color:white}</style>
