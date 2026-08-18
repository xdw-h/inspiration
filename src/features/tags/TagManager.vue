<script setup lang="ts">
import { ref } from 'vue'
import type { TagEntity } from '../ideas/types'

const props = defineProps<{ tags: TagEntity[] }>()
const emit = defineEmits<{ create: [name: string, color: string]; remove: [id: string]; rename: [id: string, name: string] }>()
const name = ref(''); const color = ref('#f47f70'); const error = ref('')
function submit() {
  const value = name.value.trim()
  if (!value || value.length > 12) { error.value = '标签名称应为 1–12 个字符'; return }
  if (props.tags.some((tag) => tag.name.toLocaleLowerCase('zh-CN') === value.toLocaleLowerCase('zh-CN'))) { error.value = '标签已存在'; return }
  error.value = ''; emit('create', value, color.value); name.value = ''
}
function rename(tag: TagEntity) { const value = prompt('新的标签名称', tag.name)?.trim(); if (value && value !== tag.name) emit('rename', tag.id, value) }
</script>

<template>
  <section class="tag-manager">
    <form @submit.prevent="submit"><input v-model="name" aria-label="标签名称" maxlength="12" placeholder="新增标签" /><input v-model="color" type="color" aria-label="标签颜色" /><button type="submit">添加</button></form>
    <p v-if="error" role="alert">{{ error }}</p>
    <div v-if="tags.length" class="tag-list"><article v-for="tag in tags" :key="tag.id"><i :style="{ background: tag.color }" /><span>{{ tag.name }}</span><button type="button" @click="rename(tag)">重命名</button><button class="danger" type="button" @click="emit('remove', tag.id)">删除</button></article></div>
    <p v-else class="empty">还没有标签，可以先创建一个。</p>
  </section>
</template>

<style scoped>
.tag-manager{display:grid;gap:12px}.tag-manager form{display:grid;grid-template-columns:1fr 44px auto;gap:8px}.tag-manager input,.tag-manager button{min-height:44px;border:1px solid #eaded7;border-radius:12px;background:#fff;padding:0 12px}.tag-manager input[type=color]{width:44px;padding:5px}.tag-manager form button{background:var(--primary);color:#fff;border:0}.tag-manager [role=alert]{margin:0;color:#b84e44}.tag-list{display:grid;gap:8px}.tag-list article{min-height:58px;padding:8px 10px;display:grid;grid-template-columns:14px 1fr auto auto;align-items:center;gap:8px;border:1px solid #eaded7;border-radius:15px;background:#fff}.tag-list i{width:12px;height:12px;border-radius:50%}.tag-list article button{min-height:36px;padding:0 8px;font-size:11px}.tag-list .danger{color:#c94d42}.empty{color:#928882;text-align:center}
</style>
