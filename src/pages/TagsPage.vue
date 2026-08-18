<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TagManager from '../features/tags/TagManager.vue'
import { createTagRepository } from '../features/tags/tagRepository'
import type { TagEntity } from '../features/ideas/types'
import { db } from '../shared/db/database'
import { createLocalContentRepository } from '../features/storage/localContentRepository'

const repository = createTagRepository(db); const tags = ref<TagEntity[]>([]); const message = ref('')
const contentRepository = createLocalContentRepository(db)
async function load() { tags.value = await repository.list() }
async function create(name: string, color: string) { await repository.create(name, color); await load() }
async function rename(id: string, name: string) { try { await repository.rename(id, name); await load() } catch (error) { message.value = error instanceof Error ? error.message : '重命名失败' } }
async function remove(id: string) { const affected = await contentRepository.countIdeasByTag(id); if (!confirm(`删除后将从 ${affected} 条灵感中移除该标签，确定继续吗？`)) return; await repository.remove(id); await load() }
async function move(id: string, direction: -1 | 1) { await repository.move(id, direction); await load() }
onMounted(load)
</script>
<template><main class="page tags-page"><header><h1>标签</h1><p>给灵感建立轻量分类。</p></header><TagManager :tags="tags" @create="create" @rename="rename" @remove="remove" @move="move" /><p v-if="message" role="alert">{{ message }}</p></main></template>
<style scoped>.tags-page{display:grid;gap:18px}.tags-page h1,.tags-page p{margin:0}.tags-page header p{margin-top:4px;color:#928882;font-size:12px}</style>
