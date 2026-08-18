<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import IdeaForm from '../features/ideas/IdeaForm.vue'
import { createIdeaRepository } from '../features/ideas/ideaRepository'
import type { IdeaDraft } from '../features/ideas/types'
import { db } from '../shared/db/database'

const router = useRouter()
const repository = createIdeaRepository(db)
const initial = ref<Partial<IdeaDraft>>({})
const busy = ref(false)
let draftTimer: ReturnType<typeof setTimeout> | undefined
onMounted(async () => { const draft = await db.drafts.get('current'); if (draft) initial.value = { title: draft.title, body: draft.body } })
function saveDraft(draft: IdeaDraft) { clearTimeout(draftTimer); draftTimer = setTimeout(() => void db.drafts.put({ id: 'current', title: draft.title, body: draft.body, audioChunks: [], updatedAt: new Date().toISOString() }), 400) }
async function save(draft: IdeaDraft) { busy.value = true; try { const idea = await repository.create(draft); await db.drafts.delete('current'); await router.replace(`/idea/${idea.id}`) } finally { busy.value = false } }
</script>
<template><main class="page"><header class="editor-header"><button type="button" aria-label="返回" @click="router.back()">←</button><h1>新增灵感</h1></header><IdeaForm :key="initial.body" :initial="initial" :busy="busy" @change="saveDraft" @save="save" /></main></template>
<style scoped>.editor-header{display:flex;align-items:center;gap:12px;margin-bottom:18px}.editor-header h1{margin:0;font-size:22px}.editor-header button{width:44px;height:44px;border:0;border-radius:13px;background:#fff4ef;font-size:22px}</style>
