<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { IdeaDraft, IdeaStatus } from './types'

const props = withDefaults(defineProps<{ initial?: Partial<IdeaDraft>; busy?: boolean }>(), { initial: () => ({}), busy: false })
const emit = defineEmits<{ save: [draft: IdeaDraft]; change: [draft: IdeaDraft] }>()
const form = reactive<IdeaDraft>({ title: props.initial.title ?? '', body: props.initial.body ?? '', status: props.initial.status ?? 'inbox', favorite: props.initial.favorite ?? false, tagIds: [...(props.initial.tagIds ?? [])] })
const error = ref('')
watch(form, () => emit('change', { ...form, tagIds: [...form.tagIds] }), { deep: true })
function submit() {
  const draft = { ...form, title: form.title.trim(), body: form.body.trim(), tagIds: [...form.tagIds] }
  if (!draft.body) { error.value = '请输入灵感内容'; return }
  error.value = ''
  emit('save', draft)
}
</script>

<template>
  <form class="idea-form" @submit.prevent="submit">
    <input v-model="form.title" maxlength="80" aria-label="灵感标题" placeholder="标题（可选）" />
    <textarea v-model="form.body" aria-label="灵感正文" placeholder="此刻想到了什么？" rows="10" />
    <div class="form-row">
      <label>状态<select v-model="form.status"><option value="inbox">待整理</option><option value="active">进行中</option><option value="done">已完成</option><option value="archived">已归档</option></select></label>
      <label class="favorite"><input v-model="form.favorite" type="checkbox" /> 收藏</label>
    </div>
    <p v-if="error" role="alert">{{ error }}</p>
    <button class="primary-button" type="submit" :disabled="busy">{{ busy ? '保存中…' : '保存' }}</button>
  </form>
</template>

<style scoped>
.idea-form { display: grid; gap: 14px; }.idea-form>input,.idea-form textarea,.idea-form select{width:100%;padding:12px;border:1px solid #eaded7;border-radius:14px;background:#fff;color:inherit;font:inherit}.idea-form>input{font-size:18px;font-weight:700}.idea-form textarea{min-height:240px;resize:vertical;line-height:1.7}.form-row{display:flex;align-items:center;justify-content:space-between}.form-row label{display:flex;align-items:center;gap:8px}.form-row select{width:auto;padding:8px}.favorite input{width:20px;height:20px}.idea-form [role=alert]{margin:0;color:#c94d42;font-size:13px}.primary-button{min-height:48px;border:0;border-radius:14px;background:var(--primary);color:white;font-size:16px;font-weight:700}
</style>
