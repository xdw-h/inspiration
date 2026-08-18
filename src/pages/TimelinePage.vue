<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue'
import { createIdeaRepository } from '../features/ideas/ideaRepository'
import { groupIdeasByDate } from '../features/ideas/timeline'
import type { IdeaEntity, TagEntity } from '../features/ideas/types'
import { createLocalContentRepository } from '../features/storage/localContentRepository'
import { db } from '../shared/db/database'
import { formatDate, formatDateTimeMinute } from '../shared/format/date'

type TimelineIdea = IdeaEntity & { hasAudio: boolean; transcript: string }
const ideas = ref<TimelineIdea[]>([])
const tags = ref<TagEntity[]>([])
const groups = computed(() => groupIdeasByDate(ideas.value) as { date: string; ideas: TimelineIdea[] }[])
const tagById = computed(() => new Map(tags.value.map((tag) => [tag.id, tag])))
const today = formatDate(new Date().toISOString())
async function load() {
  const [items, browse] = await Promise.all([createIdeaRepository(db).list(), createLocalContentRepository(db).getBrowseData()])
  tags.value = browse.tags
  ideas.value = items.map((item) => ({ ...item, hasAudio: browse.audioIdeaIds.has(item.id), transcript: browse.transcriptByIdea.get(item.id) ?? '' }))
}
onMounted(load); onActivated(load)
function summary(idea: TimelineIdea) { return idea.body || idea.transcript || '暂无文字内容' }
function time(idea: TimelineIdea) { return formatDateTimeMinute(idea.createdAt).slice(11) }
</script>

<template>
  <main class="page timeline-page">
    <header><div><h1>时间轴</h1><p>沿着时间，重遇每一个闪光。</p></div><span>{{ ideas.length }}</span></header>
    <section v-if="groups.length" class="timeline">
      <template v-for="group in groups" :key="group.date">
        <article v-for="(idea, index) in group.ideas" :key="idea.id">
          <div class="date"><strong v-if="index === 0">{{ group.date === today ? '今天' : group.date }}</strong><small>{{ time(idea) }}</small></div>
          <span class="dot" :class="{ voice: idea.hasAudio }" />
          <RouterLink :to="`/idea/${idea.id}`" class="entry-card">
            <i>{{ idea.hasAudio ? '⌁' : 'T' }}</i><div><h2>{{ idea.title || summary(idea).slice(0, 20) || '语音灵感' }}</h2><p>{{ summary(idea) }}</p><span class="tags"><em v-for="tagId in idea.tagIds.slice(0, 2)" :key="tagId">{{ tagById.get(tagId)?.name }}</em></span></div><b>›</b>
          </RouterLink>
        </article>
      </template>
    </section>
    <section v-else class="empty"><span>⌛</span><strong>时间轴还是空的</strong><p>记录第一条灵感后，它会出现在这里。</p><RouterLink to="/idea/new">开始记录</RouterLink></section>
  </main>
</template>

<style scoped>
.timeline-page{display:grid;gap:22px}.timeline-page>header{display:flex;align-items:center;justify-content:space-between}.timeline-page h1,.timeline-page p{margin:0}.timeline-page header p{margin-top:4px;color:#928882;font-size:12px}.timeline-page header>span{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:#fff0eb;color:var(--primary);font-weight:700}.timeline{display:grid}.timeline article{position:relative;display:grid;grid-template-columns:72px 20px minmax(0,1fr);gap:8px;padding-bottom:18px}.timeline article::before{content:'';position:absolute;top:18px;bottom:-8px;left:81px;width:2px;background:#f1dcd3}.timeline article:last-child::before{display:none}.date{padding-top:8px;display:grid;align-content:start;gap:4px;text-align:right}.date strong{font-size:11px}.date small{color:#9a918c;font-size:10px}.dot{z-index:1;width:12px;height:12px;margin:14px auto 0;border:3px solid #fff;border-radius:50%;background:#d5c1b7;box-shadow:0 0 0 1px #d5c1b7}.dot.voice{background:var(--primary);box-shadow:0 0 0 1px var(--primary)}.entry-card{min-width:0;padding:13px;display:grid;grid-template-columns:38px minmax(0,1fr) 12px;align-items:center;gap:10px;border:1px solid #eee2da;border-radius:17px;background:#fff;box-shadow:0 7px 22px rgba(87,57,39,.06)}.entry-card>i{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:#fff3ee;color:var(--primary);font-style:normal;font-weight:700}.entry-card h2,.entry-card p{margin:0}.entry-card h2{overflow:hidden;font-size:14px;white-space:nowrap;text-overflow:ellipsis}.entry-card p{margin-top:4px;overflow:hidden;color:#796f69;font-size:11px;white-space:nowrap;text-overflow:ellipsis}.entry-card>b{color:#c2b4ad;font-size:22px}.tags{display:flex;gap:5px;margin-top:7px}.tags em{padding:2px 6px;border-radius:999px;background:#f4efe9;color:#897b73;font-size:9px;font-style:normal}.empty{min-height:55vh;display:grid;place-content:center;justify-items:center;gap:8px;text-align:center}.empty>span{width:58px;height:58px;display:grid;place-items:center;border-radius:20px;background:#fff0eb;color:var(--primary);font-size:25px}.empty p{margin:0;color:#928882;font-size:12px}.empty a{margin-top:7px;padding:11px 20px;border-radius:12px;background:var(--primary);color:#fff;font-size:13px}
</style>
