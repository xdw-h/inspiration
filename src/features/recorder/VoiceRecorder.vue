<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { createRecorderService, type RecordedAudio } from './recorderService'

const props = withDefaults(defineProps<{ supported?: boolean; beforeRecord?: () => Promise<void> | void }>(), { supported: () => typeof MediaRecorder !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) })
const emit = defineEmits<{ recorded: [audio: RecordedAudio]; chunk: [chunk: Blob]; cancel: []; started: []; stopped: []; interrupted: [] }>()
const state = ref<'idle' | 'recording' | 'paused' | 'preview'>('idle')
const seconds = ref(0); const error = ref(''); const previewUrl = ref('')
let timer: ReturnType<typeof setInterval> | undefined
let service = createRecorderService()
const timeLabel = computed(() => `${String(Math.floor(seconds.value / 60)).padStart(2, '0')}:${String(seconds.value % 60).padStart(2, '0')}`)
function clearTimer() { clearInterval(timer); timer = undefined }
function interrupted() { clearTimer(); state.value = 'idle'; error.value = '录音被系统中断，已保存收到的录音片段，可继续补充文字或重新录音'; emit('interrupted') }
async function start() { error.value = ''; try { service = createRecorderService(undefined, undefined, (chunk) => emit('chunk', chunk), { onInterrupted: interrupted, beforeStart: props.beforeRecord }); await service.start(); state.value = 'recording'; seconds.value = 0; timer = setInterval(() => seconds.value += 1, 1000); emit('started') } catch (value) { error.value = value instanceof Error ? value.message : '录音启动失败' } }
function togglePause() { if (state.value === 'recording') { service.pause(); state.value = 'paused'; clearTimer() } else { service.resume(); state.value = 'recording'; timer = setInterval(() => seconds.value += 1, 1000) } }
async function finish() { try { const audio = await service.stop(); clearTimer(); URL.revokeObjectURL(previewUrl.value); previewUrl.value = URL.createObjectURL(audio.blob); state.value = 'preview'; emit('stopped'); emit('recorded', audio) } catch (value) { error.value = value instanceof Error ? value.message : '录音保存失败' } }
function cancel() { service.cancel(); clearTimer(); state.value = 'idle'; seconds.value = 0; emit('cancel') }
onBeforeUnmount(() => { service.cancel(); clearTimer(); URL.revokeObjectURL(previewUrl.value) })
</script>

<template>
  <section class="voice-recorder" aria-label="语音记录">
    <p v-if="!supported" class="fallback">当前浏览器不支持录音，请改用文字记录。</p>
    <template v-else>
      <div class="timer"><i :class="state" /> <strong>{{ timeLabel }}</strong><span>{{ state === 'recording' ? '正在录音' : state === 'paused' ? '已暂停' : state === 'preview' ? '录音已保存' : '准备录音' }}</span></div>
      <audio v-if="previewUrl" :src="previewUrl" controls />
      <div class="recorder-actions">
        <button v-if="state === 'idle' || state === 'preview'" type="button" aria-label="开始录音" @click="start">{{ state === 'preview' ? '重新录音' : '开始录音' }}</button>
        <button v-if="state === 'recording' || state === 'paused'" type="button" @click="togglePause">{{ state === 'recording' ? '暂停' : '继续' }}</button>
        <button v-if="state === 'recording' || state === 'paused'" class="finish" type="button" @click="finish">结束录音</button>
        <button v-if="state !== 'idle'" type="button" @click="cancel">取消</button>
      </div>
    </template>
    <p v-if="error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped>
.voice-recorder{padding:18px;display:grid;gap:14px;border:1px solid #eaded7;border-radius:18px;background:#fff8f4}.timer{display:grid;grid-template-columns:12px auto 1fr;align-items:center;gap:9px}.timer i{width:10px;height:10px;border-radius:50%;background:#c8bdb7}.timer i.recording{background:#e25349;box-shadow:0 0 0 5px #ffe5e1}.timer strong{font-size:26px}.timer span{color:#8f8580;font-size:12px}.voice-recorder audio{width:100%}.recorder-actions{display:flex;gap:8px;flex-wrap:wrap}.recorder-actions button{min-height:44px;padding:0 14px;border:1px solid #eaded7;border-radius:12px;background:#fff}.recorder-actions .finish{background:var(--primary);color:white}.fallback,.voice-recorder [role=alert]{margin:0;color:#b84e44;font-size:13px}
</style>
