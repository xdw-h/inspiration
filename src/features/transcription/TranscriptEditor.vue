<script setup lang="ts">
import type { TranscriptStatus } from '../ideas/types'

defineProps<{ status: TranscriptStatus; text: string; interim?: string }>()
const emit = defineEmits<{ update: [text: string, manuallyEdited: boolean] }>()
</script>

<template>
  <section class="transcript-editor">
    <header><strong>语音转写</strong><span>{{ status === 'listening' ? '识别中' : status === 'completed' ? '已完成' : status === 'failed' ? '识别失败' : status === 'not_supported' ? '不支持' : '等待录音' }}</span></header>
    <p v-if="status === 'not_supported'" class="hint">当前浏览器不支持自动转写，录音仍会正常保存。</p>
    <p v-else-if="status === 'failed'" class="hint">自动转写失败，原始录音已经保留。</p>
    <textarea v-if="status !== 'not_supported'" :value="text" rows="5" aria-label="转写文本" placeholder="转写内容将在这里显示，也可以手动修改" @input="emit('update', ($event.target as HTMLTextAreaElement).value, true)" />
    <small v-if="interim">正在识别：{{ interim }}</small>
  </section>
</template>

<style scoped>
.transcript-editor{padding:14px;display:grid;gap:10px;border:1px solid #eaded7;border-radius:16px;background:#fff}.transcript-editor header{display:flex;justify-content:space-between}.transcript-editor header span,.transcript-editor small{color:#948983;font-size:11px}.transcript-editor textarea{width:100%;padding:10px;border:1px solid #eee2da;border-radius:12px;font:inherit;line-height:1.6;resize:vertical}.hint{margin:0;color:#a65b50;font-size:12px}
</style>
