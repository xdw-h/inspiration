<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IdeaForm from '../features/ideas/IdeaForm.vue'
import { createIdeaRepository } from '../features/ideas/ideaRepository'
import type { IdeaDraft, IdeaEntity } from '../features/ideas/types'
import { db } from '../shared/db/database'
import { formatDateTime } from '../shared/format/date'

const route = useRoute(); const router = useRouter(); const repository = createIdeaRepository(db)
const idea = ref<IdeaEntity>(); const busy = ref(false); const error = ref('')
onMounted(async () => { idea.value = await repository.get(String(route.params.id)); if (!idea.value) error.value = '灵感不存在或已被删除' })
async function save(draft: IdeaDraft) { if (!idea.value) return; busy.value = true; try { idea.value = await repository.update(idea.value.id, draft) } finally { busy.value = false } }
async function remove() { if (!idea.value || !confirm('确定删除这条灵感吗？')) return; await repository.remove(idea.value.id); await router.replace('/') }
</script>
<template><main class="page"><header class="detail-header"><button type="button" aria-label="返回" @click="router.back()">←</button><div><h1>灵感详情</h1><small v-if="idea">创建于 {{ formatDateTime(idea.createdAt) }}</small></div><button v-if="idea" class="delete" type="button" @click="remove">删除</button></header><p v-if="error" role="alert">{{ error }}</p><IdeaForm v-if="idea" :initial="idea" :busy="busy" @save="save" /></main></template>
<style scoped>.detail-header{display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:10px;margin-bottom:18px}.detail-header h1{margin:0;font-size:20px}.detail-header small{color:#9a918c;font-size:10px}.detail-header button{min-width:44px;height:44px;border:0;border-radius:13px;background:#fff4ef}.detail-header .delete{color:#c94d42}</style>
