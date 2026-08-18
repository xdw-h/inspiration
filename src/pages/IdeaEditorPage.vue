<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import IdeaForm from '../features/ideas/IdeaForm.vue'
import { createIdeaRepository } from '../features/ideas/ideaRepository'
import type { IdeaDraft } from '../features/ideas/types'
import { db } from '../shared/db/database'
import VoiceRecorder from '../features/recorder/VoiceRecorder.vue'
import type { RecordedAudio } from '../features/recorder/recorderService'
import { createId } from '../shared/id/createId'
import TranscriptEditor from '../features/transcription/TranscriptEditor.vue'
import { createTranscriptionService, detectSpeechRecognition, mergeTranscript } from '../features/transcription/transcriptionService'
import type { TranscriptStatus } from '../features/ideas/types'
import type { TagEntity } from '../features/ideas/types'
import { createTagRepository } from '../features/tags/tagRepository'
import { createLocalContentRepository } from '../features/storage/localContentRepository'

const router = useRouter()
const repository = createIdeaRepository(db)
const contentRepository = createLocalContentRepository(db)
const initial = ref<Partial<IdeaDraft>>({})
const busy = ref(false)
const mode = ref<'text' | 'voice'>('text')
const audio = ref<RecordedAudio>()
const transcript = ref('')
const interim = ref('')
const transcriptStatus = ref<TranscriptStatus>(detectSpeechRecognition() ? 'idle' : 'not_supported')
const manuallyEdited = ref(false)
const tags = ref<TagEntity[]>([])
const recoveredAudio = ref(false)
const transcription = createTranscriptionService({
  onFinal: (text) => { transcript.value = mergeTranscript({ text: transcript.value, manuallyEdited: manuallyEdited.value }, text) },
  onInterim: (text) => { interim.value = text },
  onError: () => { transcriptStatus.value = 'failed'; interim.value = '' },
  onEnd: () => { if (transcriptStatus.value === 'listening') transcriptStatus.value = transcript.value ? 'completed' : 'failed'; interim.value = '' },
})
let draftTimer: ReturnType<typeof setTimeout> | undefined
onMounted(async () => { const [draft, tagItems] = await Promise.all([contentRepository.getDraft(), createTagRepository(db).list()]); tags.value = tagItems; if (draft) { initial.value = { title: draft.title, body: draft.body }; if (draft.audioChunks.length) { const blob = new Blob(draft.audioChunks, { type: draft.audioChunks[0].type || 'audio/webm' }); audio.value = { blob, mimeType: blob.type, size: blob.size, durationMs: 0 }; mode.value = 'voice'; recoveredAudio.value = true } } })
function saveDraft(draft: IdeaDraft) { clearTimeout(draftTimer); draftTimer = setTimeout(async () => { const current = await contentRepository.getDraft(); await contentRepository.saveDraft({ title: draft.title, body: draft.body, audioChunks: current?.audioChunks ?? [] }) }, 400) }
function startTranscription() { if (transcription.start()) transcriptStatus.value = 'listening' }
function stopTranscription() { transcription.stop() }
function updateTranscript(text: string, manual: boolean) { transcript.value = text; manuallyEdited.value = manual }
async function save(draft: IdeaDraft) { busy.value = true; try { const idea = await repository.create(draft); const now = new Date().toISOString(); await contentRepository.saveAudioAndTranscript(idea.id, audio.value ? { id: createId(), ...audio.value, createdAt: now } : undefined, audio.value ? { id: createId(), text: transcript.value.trim(), status: transcriptStatus.value, manuallyEdited: manuallyEdited.value, updatedAt: now } : undefined); await contentRepository.clearDraft(); await router.replace(`/idea/${idea.id}`) } finally { busy.value = false } }
</script>
<template><main class="page"><header class="editor-header"><button type="button" aria-label="返回" @click="router.back()">←</button><h1>新增灵感</h1></header><div class="mode-tabs"><button type="button" :aria-pressed="mode === 'text'" @click="mode = 'text'">文字记录</button><button type="button" :aria-pressed="mode === 'voice'" @click="mode = 'voice'">语音记录</button></div><template v-if="mode === 'voice'"><p v-if="recoveredAudio" class="recovered" role="status">已恢复上次中断前保存的录音片段，可直接保存或重新录音。</p><VoiceRecorder @started="startTranscription" @stopped="stopTranscription" @chunk="contentRepository.appendDraftChunk($event)" @recorded="audio = $event; recoveredAudio = false" @cancel="audio = undefined; recoveredAudio = false; contentRepository.clearDraftAudio(); transcription.cancel()" /><TranscriptEditor :status="transcriptStatus" :text="transcript" :interim="interim" @update="updateTranscript" /></template><IdeaForm :key="initial.body" :initial="initial" :busy="busy" :tags="tags" :allow-empty-body="Boolean(audio)" @change="saveDraft" @save="save" /></main></template>
<style scoped>.editor-header{display:flex;align-items:center;gap:12px;margin-bottom:18px}.editor-header h1{margin:0;font-size:22px}.editor-header button{width:44px;height:44px;border:0;border-radius:13px;background:#fff4ef;font-size:22px}.mode-tabs{margin-bottom:14px;padding:4px;display:grid;grid-template-columns:1fr 1fr;gap:4px;border-radius:14px;background:#fff3ed}.mode-tabs button{min-height:40px;border:0;border-radius:11px;background:transparent;color:#8e817b}.mode-tabs button[aria-pressed=true]{background:#fff;color:var(--primary);font-weight:700;box-shadow:0 3px 10px rgba(87,57,39,.08)}.recovered{margin:0 0 10px;padding:10px;border-radius:12px;background:#fff4d9;color:#8a681a;font-size:12px}</style>
