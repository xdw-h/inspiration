<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IdeaForm from '../features/ideas/IdeaForm.vue'
import { createIdeaRepository } from '../features/ideas/ideaRepository'
import type { IdeaDraft, IdeaEntity } from '../features/ideas/types'
import { db } from '../shared/db/database'
import { formatDateTime } from '../shared/format/date'
import type { AudioAssetEntity, TranscriptEntity } from '../features/ideas/types'
import TranscriptEditor from '../features/transcription/TranscriptEditor.vue'
import type { TagEntity } from '../features/ideas/types'
import { createTagRepository } from '../features/tags/tagRepository'

const route = useRoute(); const router = useRouter(); const repository = createIdeaRepository(db)
const idea = ref<IdeaEntity>(); const busy = ref(false); const error = ref('')
const audio = ref<AudioAssetEntity>(); const transcript = ref<TranscriptEntity>(); const audioUrl = ref('')
const tags = ref<TagEntity[]>([])
onMounted(async () => { const id = String(route.params.id); [idea.value, audio.value, transcript.value, tags.value] = await Promise.all([repository.get(id), db.audioAssets.where('ideaId').equals(id).first(), db.transcripts.where('ideaId').equals(id).first(), createTagRepository(db).list()]); if (!idea.value) { error.value = '灵感不存在或已被删除'; return }; if (audio.value) audioUrl.value = URL.createObjectURL(audio.value.blob) })
async function save(draft: IdeaDraft) { if (!idea.value) return; busy.value = true; try { idea.value = await repository.update(idea.value.id, draft) } finally { busy.value = false } }
async function remove() { if (!idea.value || !confirm('确定删除这条灵感吗？')) return; await repository.remove(idea.value.id); await router.replace('/') }
async function updateTranscript(text: string, manual: boolean) { if (!transcript.value) return; transcript.value = { ...transcript.value, text, manuallyEdited: manual, updatedAt: new Date().toISOString() }; await db.transcripts.put(transcript.value) }
</script>
<template><main class="page"><header class="detail-header"><button type="button" aria-label="返回" @click="router.back()">←</button><div><h1>灵感详情</h1><small v-if="idea">创建于 {{ formatDateTime(idea.createdAt) }}</small></div><button v-if="idea" class="delete" type="button" @click="remove">删除</button></header><p v-if="error" role="alert">{{ error }}</p><audio v-if="audioUrl" class="saved-audio" :src="audioUrl" controls /><TranscriptEditor v-if="transcript" :status="transcript.status" :text="transcript.text" @update="updateTranscript" /><IdeaForm v-if="idea" :initial="idea" :busy="busy" :tags="tags" :allow-empty-body="Boolean(audio)" @save="save" /></main></template>
<style scoped>.detail-header{display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:10px;margin-bottom:18px}.detail-header h1{margin:0;font-size:20px}.detail-header small{color:#9a918c;font-size:10px}.detail-header button{min-width:44px;height:44px;border:0;border-radius:13px;background:#fff4ef}.detail-header .delete{color:#c94d42}.saved-audio{width:100%;margin-bottom:12px}</style>
