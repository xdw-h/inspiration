# Local Inspiration H5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, fully local PWA for text and voice inspiration capture, with optional browser speech transcription and ZIP backup.

**Architecture:** Vue pages call focused feature services and repositories; only repositories access Dexie. Audio Blob data is stored separately from idea metadata. MediaRecorder and Web Speech capabilities are detected at runtime, with recording-only fallback when transcription is unavailable.

**Tech Stack:** Vue 3, TypeScript, Vite, Vue Router, Pinia, Dexie, JSZip, Vitest, Vue Test Utils, Playwright

---

## Execution preflight

`D:\inspiration` was not a Git repository when this plan was written. Before Task 1, run `git init`, then create an initial commit containing the approved design and this plan. All later commit steps depend on that repository initialization.

## File map

| Area | Files | Responsibility |
|---|---|---|
| App shell | `package.json`, `vite.config.ts`, `src/main.ts`, `src/App.vue`, `src/router.ts`, `public/sw.js`, `public/manifest.webmanifest` | Build, navigation, installation and offline shell |
| Data | `src/shared/db/database.ts`, `src/features/ideas/types.ts`, `src/features/ideas/ideaRepository.ts` | Schema, migrations and transactional persistence |
| Capture | `src/features/recorder/recorderService.ts`, `src/features/transcription/transcriptionService.ts`, `src/pages/IdeaEditorPage.vue` | Text entry, recording and optional transcription |
| Browse | `src/pages/IdeasPage.vue`, `src/pages/IdeaDetailPage.vue`, `src/pages/TagsPage.vue` | List, search, filtering and editing |
| Safety | `src/features/backup/backupService.ts`, `src/features/storage/storageProtection.ts`, `src/pages/SettingsPage.vue` | Backup, restore and browser storage visibility |
| Shared | `src/shared/format/date.ts`, `src/shared/id/createId.ts`, `src/styles/tokens.css`, `src/styles/base.css` | Formatting, IDs and mobile visual system |

## Task 1: Scaffold the installable offline application

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`
- Create: `src/main.ts`, `src/App.vue`, `src/router.ts`
- Create: `public/manifest.webmanifest`, `public/sw.js`
- Test: `tests/unit/appShell.spec.ts`, `tests/unit/pwaAssets.spec.ts`

- [ ] **Step 1: Write failing app-shell and PWA asset tests**

```ts
// tests/unit/appShell.spec.ts
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import App from '../../src/App.vue'

describe('app shell', () => {
  it('shows the three primary destinations and capture action', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<main>灵感</main>' } }] })
    await router.push('/'); await router.isReady()
    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('灵感')
    expect(wrapper.text()).toContain('标签')
    expect(wrapper.text()).toContain('设置')
    expect(wrapper.get('[aria-label="新增灵感"]')).toBeTruthy()
  })
})
```

```ts
// tests/unit/pwaAssets.spec.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('PWA assets', () => {
  it('declares standalone display and offline navigation fallback', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'))
    const worker = readFileSync('public/sw.js', 'utf8')
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('./')
    expect(worker).toContain("event.request.mode === 'navigate'")
    expect(worker).toContain("caches.match(`${BASE}index.html`)")
  })
})
```

- [ ] **Step 2: Run tests and confirm the missing app files fail**

Run: `npm install && npm test -- --run tests/unit/appShell.spec.ts tests/unit/pwaAssets.spec.ts`  
Expected: FAIL because `src/App.vue` and PWA assets do not exist.

- [ ] **Step 3: Create the Vue shell, router and PWA assets**

Use dependency versions aligned with `D:\money`: Vue `^3.5.18`, Router `^4.5.1`, Pinia `^3.0.3`, Dexie `^4.0.11`, JSZip `^3.10.1`, Vite `6.4.3`, Vitest `^3.2.4`, Playwright `^1.54.2` and TypeScript `~5.8.3`. Define scripts `dev`, `build`, `preview`, `test`, and `test:e2e`.

```ts
// src/router.ts
import { createRouter, createWebHashHistory } from 'vue-router'
export default createRouter({ history: createWebHashHistory(import.meta.env.BASE_URL), routes: [
  { path: '/', component: () => import('./pages/IdeasPage.vue') },
  { path: '/idea/new', component: () => import('./pages/IdeaEditorPage.vue'), meta: { hideNav: true } },
  { path: '/idea/:id', component: () => import('./pages/IdeaDetailPage.vue'), meta: { hideNav: true } },
  { path: '/tags', component: () => import('./pages/TagsPage.vue') },
  { path: '/settings', component: () => import('./pages/SettingsPage.vue') },
] })
```

```ts
// src/main.ts
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'
import './styles/base.css'
createApp(App).use(createPinia()).use(router).mount('#app')
window.addEventListener('load', () => navigator.serviceWorker?.register(`${import.meta.env.BASE_URL}sw.js`))
```

Create `App.vue` with `<RouterView />`, bottom links to `/`, `/tags`, `/settings`, a central `/idea/new` link with `aria-label="新增灵感"`, and hide navigation when `route.meta.hideNav` is true. Create placeholder page components containing one `<main>` heading so lazy imports compile.

- [ ] **Step 4: Verify tests and production build**

Run: `npm test -- --run tests/unit/appShell.spec.ts tests/unit/pwaAssets.spec.ts && npm run build`  
Expected: all tests PASS and Vite produces `dist/` without type errors.

- [ ] **Step 5: Commit the shell**

Run: `git add package.json package-lock.json index.html vite.config.ts tsconfig*.json src public tests && git commit -m "feat: scaffold local inspiration PWA"`

## Task 2: Add the IndexedDB model and repositories

**Files:**
- Create: `src/shared/db/database.ts`, `src/shared/id/createId.ts`
- Create: `src/features/ideas/types.ts`, `src/features/ideas/ideaRepository.ts`, `src/features/tags/tagRepository.ts`
- Test: `tests/unit/ideaRepository.spec.ts`, `tests/unit/tagRepository.spec.ts`

- [ ] **Step 1: Write failing repository tests**

```ts
// tests/unit/ideaRepository.spec.ts
import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InspirationDatabase } from '../../src/shared/db/database'
import { createIdeaRepository } from '../../src/features/ideas/ideaRepository'

describe('idea repository', () => {
  let db: InspirationDatabase
  beforeEach(() => { db = new InspirationDatabase(`test-${crypto.randomUUID()}`) })
  afterEach(async () => db.delete())

  it('creates and lists newest ideas without loading audio blobs', async () => {
    const repo = createIdeaRepository(db)
    const first = await repo.create({ title: '旧', body: '内容', status: 'inbox', favorite: false, tagIds: [] })
    const second = await repo.create({ title: '新', body: '内容', status: 'inbox', favorite: true, tagIds: [] })
    const items = await repo.list()
    expect(items.map(item => item.id)).toEqual([second.id, first.id])
    expect('blob' in items[0]).toBe(false)
  })

  it('deletes linked audio and transcript transactionally', async () => {
    const repo = createIdeaRepository(db)
    const idea = await repo.create({ title: '语音', body: '', status: 'inbox', favorite: false, tagIds: [] })
    await db.audioAssets.add({ id: 'audio-1', ideaId: idea.id, blob: new Blob(['voice']), mimeType: 'audio/webm', size: 5, durationMs: 1000, createdAt: new Date().toISOString() })
    await db.transcripts.add({ id: 'transcript-1', ideaId: idea.id, text: '你好', status: 'completed', manuallyEdited: false, updatedAt: new Date().toISOString() })
    await repo.remove(idea.id)
    expect(await db.audioAssets.where('ideaId').equals(idea.id).count()).toBe(0)
    expect(await db.transcripts.where('ideaId').equals(idea.id).count()).toBe(0)
  })
})
```

- [ ] **Step 2: Run the repository tests and confirm failure**

Run: `npm test -- --run tests/unit/ideaRepository.spec.ts tests/unit/tagRepository.spec.ts`  
Expected: FAIL because schema and repositories are missing.

- [ ] **Step 3: Implement schema, entities and repositories**

```ts
// src/features/ideas/types.ts
export type IdeaStatus = 'inbox' | 'active' | 'done' | 'archived'
export type TranscriptStatus = 'not_supported' | 'idle' | 'listening' | 'completed' | 'failed'
export interface IdeaEntity { id: string; title: string; body: string; status: IdeaStatus; favorite: boolean; tagIds: string[]; createdAt: string; updatedAt: string }
export interface AudioAssetEntity { id: string; ideaId: string; blob: Blob; mimeType: string; size: number; durationMs: number; createdAt: string }
export interface TranscriptEntity { id: string; ideaId: string; text: string; status: TranscriptStatus; manuallyEdited: boolean; updatedAt: string }
export interface TagEntity { id: string; name: string; color: string; order: number; createdAt: string }
export interface DraftEntity { id: 'current'; title: string; body: string; audioChunks: Blob[]; updatedAt: string }
export type IdeaDraft = Pick<IdeaEntity, 'title' | 'body' | 'status' | 'favorite' | 'tagIds'>
```

```ts
// src/shared/db/database.ts
import Dexie, { type EntityTable } from 'dexie'
import type { AudioAssetEntity, DraftEntity, IdeaEntity, TagEntity, TranscriptEntity } from '../../features/ideas/types'
export class InspirationDatabase extends Dexie {
  ideas!: EntityTable<IdeaEntity, 'id'>; audioAssets!: EntityTable<AudioAssetEntity, 'id'>
  transcripts!: EntityTable<TranscriptEntity, 'id'>; tags!: EntityTable<TagEntity, 'id'>; drafts!: EntityTable<DraftEntity, 'id'>
  constructor(name = 'local-inspiration') { super(name); this.version(1).stores({
    ideas: 'id, status, favorite, createdAt, updatedAt, *tagIds', audioAssets: 'id, ideaId, createdAt',
    transcripts: 'id, &ideaId, status, updatedAt', tags: 'id, &name, order', drafts: 'id, updatedAt',
  }) }
}
export const db = new InspirationDatabase()
```

Implement `createIdeaRepository(database)` with `create`, `get`, `list`, `update`, `remove`, and `search`. Generate IDs with `crypto.randomUUID()`, use ISO timestamps internally, sort list by `updatedAt` descending, and delete idea/audio/transcript in one Dexie transaction. Implement tag create/rename/reorder/remove; removing a tag updates every referencing idea in the same transaction.

- [ ] **Step 4: Verify repositories**

Run: `npm test -- --run tests/unit/ideaRepository.spec.ts tests/unit/tagRepository.spec.ts`  
Expected: PASS, including transactional linked-data deletion.

- [ ] **Step 5: Commit persistence**

Run: `git add src/shared src/features/ideas src/features/tags tests/unit/*Repository.spec.ts && git commit -m "feat: add local idea persistence"`

## Task 3: Implement shared date formatting and text idea flow

**Files:**
- Create: `src/shared/format/date.ts`, `src/features/ideas/IdeaForm.vue`
- Modify: `src/pages/IdeaEditorPage.vue`, `src/pages/IdeasPage.vue`, `src/pages/IdeaDetailPage.vue`
- Test: `tests/unit/date.spec.ts`, `tests/unit/IdeaForm.spec.ts`

- [ ] **Step 1: Write date and form tests**

```ts
// tests/unit/date.spec.ts
import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime } from '../../src/shared/format/date'
describe('date formatting', () => {
  it('formats ISO, zoned, database and empty values safely', () => {
    expect(formatDate('2026-08-05')).toBe('2026-08-05')
    expect(formatDateTime('2026-08-05 08:23:10')).toMatch(/^2026-08-05 08:23:10$/)
    expect(formatDateTime('2026-08-05T08:23:10.000+00:00')).not.toMatch(/[TZ]|\.000|\+00:00/)
    expect(formatDateTime(null)).toBe('-')
    expect(formatDateTime('bad')).toBe('-')
  })
})
```

```ts
// tests/unit/IdeaForm.spec.ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IdeaForm from '../../src/features/ideas/IdeaForm.vue'
describe('IdeaForm', () => {
  it('emits trimmed text content', async () => {
    const wrapper = mount(IdeaForm)
    await wrapper.get('[aria-label="灵感正文"]').setValue('  一个想法  ')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({ body: '一个想法', status: 'inbox', favorite: false })
  })
})
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm test -- --run tests/unit/date.spec.ts tests/unit/IdeaForm.spec.ts`  
Expected: FAIL because formatter and form are missing.

- [ ] **Step 3: Implement formatter and text pages**

Implement `parseDate`, `formatDate`, `formatDateTime`, and `formatDateTimeMinute` with explicit numeric padding; convert zoned timestamps through `Date`, treat `YYYY-MM-DD HH:mm:ss` as local database time, and return `-` on null or invalid input. Do not call `toLocaleString()`.

Create `IdeaForm.vue` with optional title, required body, status, favorite and tags. Save drafts after 400 ms of inactivity through `db.drafts.put`, restore on mount, and clear only after repository save succeeds. `IdeasPage.vue` loads repository summaries, and `IdeaDetailPage.vue` loads one idea plus its separately queried audio/transcript records.

- [ ] **Step 4: Verify text flow**

Run: `npm test -- --run tests/unit/date.spec.ts tests/unit/IdeaForm.spec.ts && npm run build`  
Expected: PASS; build contains no `Invalid Date` rendering or raw ISO interpolation.

- [ ] **Step 5: Commit text capture**

Run: `git add src/shared/format src/features/ideas src/pages tests/unit/date.spec.ts tests/unit/IdeaForm.spec.ts && git commit -m "feat: add text inspiration flow"`

## Task 4: Add resilient local voice recording

**Files:**
- Create: `src/features/recorder/recorderService.ts`, `src/features/recorder/VoiceRecorder.vue`
- Modify: `src/pages/IdeaEditorPage.vue`
- Test: `tests/unit/recorderService.spec.ts`, `tests/unit/VoiceRecorder.spec.ts`

- [ ] **Step 1: Write recorder capability tests**

```ts
// tests/unit/recorderService.spec.ts
import { describe, expect, it, vi } from 'vitest'
import { chooseAudioMimeType, createRecorderService } from '../../src/features/recorder/recorderService'
describe('recorder service', () => {
  it('chooses the first supported mobile audio type', () => {
    const supported = vi.fn((type: string) => type === 'audio/mp4')
    expect(chooseAudioMimeType(supported)).toBe('audio/mp4')
  })
  it('returns a clear permission error', async () => {
    const service = createRecorderService({ getUserMedia: vi.fn().mockRejectedValue(Object.assign(new Error(), { name: 'NotAllowedError' })) } as never)
    await expect(service.start()).rejects.toThrow('麦克风权限被拒绝')
  })
})
```

- [ ] **Step 2: Run recorder tests and confirm failure**

Run: `npm test -- --run tests/unit/recorderService.spec.ts tests/unit/VoiceRecorder.spec.ts`  
Expected: FAIL because recorder service and component are missing.

- [ ] **Step 3: Implement MediaRecorder service and component**

```ts
// core contract in src/features/recorder/recorderService.ts
const TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
export function chooseAudioMimeType(supported = MediaRecorder.isTypeSupported.bind(MediaRecorder)) {
  return TYPES.find(type => supported(type)) ?? ''
}
export interface RecordedAudio { blob: Blob; mimeType: string; size: number; durationMs: number }
```

`createRecorderService` must expose `start`, `pause`, `resume`, `stop`, and `cancel`. Start `MediaRecorder` with a 1000 ms timeslice, persist each non-empty chunk into the current draft, stop all media tracks on stop/cancel, and map `NotAllowedError`, missing API, empty recording and unexpected termination to Chinese actionable messages. `VoiceRecorder.vue` shows `mm:ss`, recording state, pause/resume, finish and cancel; it emits `recorded` only after a non-empty Blob is produced.

- [ ] **Step 4: Verify recording behavior**

Run: `npm test -- --run tests/unit/recorderService.spec.ts tests/unit/VoiceRecorder.spec.ts && npm run build`  
Expected: PASS; unsupported MediaRecorder shows text-capture fallback rather than crashing.

- [ ] **Step 5: Commit recording**

Run: `git add src/features/recorder src/pages/IdeaEditorPage.vue tests/unit/*Recorder* tests/unit/recorderService.spec.ts && git commit -m "feat: add local voice recording"`

## Task 5: Add optional browser transcription with safe fallback

**Files:**
- Create: `src/features/transcription/transcriptionService.ts`, `src/features/transcription/TranscriptEditor.vue`
- Modify: `src/pages/IdeaEditorPage.vue`, `src/pages/IdeaDetailPage.vue`
- Test: `tests/unit/transcriptionService.spec.ts`, `tests/unit/TranscriptEditor.spec.ts`

- [ ] **Step 1: Write support and overwrite-protection tests**

```ts
// tests/unit/transcriptionService.spec.ts
import { describe, expect, it } from 'vitest'
import { detectSpeechRecognition, mergeTranscript } from '../../src/features/transcription/transcriptionService'
describe('transcription fallback', () => {
  it('reports unsupported without throwing', () => expect(detectSpeechRecognition({} as Window)).toBeNull())
  it('does not overwrite manually edited text', () => {
    expect(mergeTranscript({ text: '人工修正', manuallyEdited: true }, '机器文本')).toBe('人工修正')
  })
})
```

- [ ] **Step 2: Run transcription tests and confirm failure**

Run: `npm test -- --run tests/unit/transcriptionService.spec.ts tests/unit/TranscriptEditor.spec.ts`  
Expected: FAIL because transcription module is missing.

- [ ] **Step 3: Implement capability-detected live transcription**

Detect `window.SpeechRecognition` and `window.webkitSpeechRecognition` without assuming either exists. Configure Chinese recognition with `lang = 'zh-CN'`, `continuous = true`, and `interimResults = true`. Persist only final results; display interim text separately. On unsupported API save transcript status `not_supported`; on recognition error save `failed` while leaving the audio record untouched. When `manuallyEdited` is true, later machine events cannot replace stored text.

- [ ] **Step 4: Verify supported and unsupported paths**

Run: `npm test -- --run tests/unit/transcriptionService.spec.ts tests/unit/TranscriptEditor.spec.ts && npm run build`  
Expected: PASS; unsupported environments display “当前浏览器不支持自动转写，录音仍会正常保存”。

- [ ] **Step 5: Commit transcription fallback**

Run: `git add src/features/transcription src/pages tests/unit/transcriptionService.spec.ts tests/unit/TranscriptEditor.spec.ts && git commit -m "feat: add optional local transcription"`

## Task 6: Add search, filters and tag management

**Files:**
- Create: `src/features/ideas/ideaSearch.ts`, `src/features/tags/TagManager.vue`
- Modify: `src/pages/IdeasPage.vue`, `src/pages/TagsPage.vue`
- Test: `tests/unit/ideaSearch.spec.ts`, `tests/unit/TagManager.spec.ts`

- [ ] **Step 1: Write failing search tests**

```ts
// tests/unit/ideaSearch.spec.ts
import { describe, expect, it } from 'vitest'
import { filterIdeas } from '../../src/features/ideas/ideaSearch'
describe('idea search', () => {
  const ideas = [{ id: '1', title: '产品', body: '', transcript: '语音内容', favorite: true, status: 'inbox', tagIds: ['a'] }]
  it('searches title, body and transcript', () => expect(filterIdeas(ideas, { query: '语音', tagId: '', status: '', favoriteOnly: false })).toHaveLength(1))
  it('combines filters', () => expect(filterIdeas(ideas, { query: '', tagId: 'a', status: 'inbox', favoriteOnly: true })).toHaveLength(1))
})
```

- [ ] **Step 2: Run search and tag tests and confirm failure**

Run: `npm test -- --run tests/unit/ideaSearch.spec.ts tests/unit/TagManager.spec.ts`  
Expected: FAIL because search and tag UI are missing.

- [ ] **Step 3: Implement deterministic local filtering and tags**

Normalize search with `trim().toLocaleLowerCase('zh-CN')`; match title, body and transcript, then apply type/status/favorite/tag filters with AND semantics. Keep filter state in Pinia while navigating to detail and back. Validate tag names as 1–12 trimmed characters and reject case-insensitive duplicates. Confirm tag deletion and show affected-idea count before repository removal.

- [ ] **Step 4: Verify browse behavior**

Run: `npm test -- --run tests/unit/ideaSearch.spec.ts tests/unit/TagManager.spec.ts && npm run build`  
Expected: PASS; combined filters return stable results and tag deletion updates linked ideas.

- [ ] **Step 5: Commit organization features**

Run: `git add src/features/ideas src/features/tags src/pages tests/unit/ideaSearch.spec.ts tests/unit/TagManager.spec.ts && git commit -m "feat: add inspiration search and tags"`

## Task 7: Add storage protection and ZIP backup/restore

**Files:**
- Create: `src/features/storage/storageProtection.ts`, `src/features/backup/types.ts`, `src/features/backup/backupService.ts`
- Modify: `src/pages/SettingsPage.vue`
- Test: `tests/unit/storageProtection.spec.ts`, `tests/unit/backupService.spec.ts`

- [ ] **Step 1: Write failing backup integrity test**

```ts
// tests/unit/backupService.spec.ts
import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { InspirationDatabase } from '../../src/shared/db/database'
import { exportBackup, importBackup } from '../../src/features/backup/backupService'
describe('backup', () => {
  it('round-trips ideas and audio', async () => {
    const source = new InspirationDatabase(`source-${crypto.randomUUID()}`)
    const target = new InspirationDatabase(`target-${crypto.randomUUID()}`)
    await source.ideas.add({ id: 'i1', title: '声音', body: '', status: 'inbox', favorite: false, tagIds: [], createdAt: '2026-08-18T00:00:00.000Z', updatedAt: '2026-08-18T00:00:00.000Z' })
    await source.audioAssets.add({ id: 'a1', ideaId: 'i1', blob: new Blob(['voice']), mimeType: 'audio/webm', size: 5, durationMs: 1000, createdAt: '2026-08-18T00:00:00.000Z' })
    const result = await importBackup(await exportBackup(source), target)
    expect(result).toEqual({ imported: 1, skipped: 0, audio: 1 })
    expect(await target.audioAssets.get('a1')).toBeTruthy()
    await source.delete(); await target.delete()
  })
})
```

- [ ] **Step 2: Run safety tests and confirm failure**

Run: `npm test -- --run tests/unit/storageProtection.spec.ts tests/unit/backupService.spec.ts`  
Expected: FAIL because storage and backup services are missing.

- [ ] **Step 3: Implement versioned ZIP and storage status**

Export `manifest.json`, `ideas.json`, and `audio/<id>.<ext>`. Manifest version is `1` and includes creation ISO time, idea count and audio count. Import must parse and validate all JSON, ensure unique IDs, confirm every audio `ideaId` exists and every listed audio file exists before opening a write transaction. Same idea IDs are skipped. Implement `navigator.storage.estimate`, `persisted`, and `persist` wrappers returning `supported`, `persisted`, `usage`, `quota`, and a safe error string.

- [ ] **Step 4: Verify backup and settings build**

Run: `npm test -- --run tests/unit/storageProtection.spec.ts tests/unit/backupService.spec.ts && npm run build`  
Expected: PASS; corrupt or incomplete ZIP changes no existing database rows.

- [ ] **Step 5: Commit local data safety**

Run: `git add src/features/storage src/features/backup src/pages/SettingsPage.vue tests/unit/storageProtection.spec.ts tests/unit/backupService.spec.ts && git commit -m "feat: add local backup and storage protection"`

## Task 8: Complete responsive styling and end-to-end verification

**Files:**
- Modify: `src/styles/tokens.css`, `src/styles/base.css`, all page and feature components as needed for layout only
- Create: `playwright.config.ts`, `tests/e2e/capture-flow.spec.ts`, `tests/e2e/pwa-offline.spec.ts`, `tests/e2e/mobile-layout.spec.ts`

- [ ] **Step 1: Write failing mobile and offline flows**

```ts
// tests/e2e/capture-flow.spec.ts
import { expect, test } from '@playwright/test'
test('creates, reloads, searches and deletes a text idea', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('新增灵感').click()
  await page.getByLabel('灵感正文').fill('散步时想到的产品点子')
  await page.getByRole('button', { name: '保存' }).click()
  await page.reload()
  await page.getByLabel('搜索灵感').fill('产品点子')
  await expect(page.getByText('散步时想到的产品点子')).toBeVisible()
})
```

```ts
// tests/e2e/mobile-layout.spec.ts
import { expect, test } from '@playwright/test'
for (const width of [375, 390, 430]) test(`${width}px has no horizontal overflow`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 }); await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
```

- [ ] **Step 2: Run end-to-end tests and confirm layout failures**

Run: `npm run build && npx playwright test`  
Expected: capture behavior passes after prior tasks; mobile or offline tests initially identify missing final styling/cache details.

- [ ] **Step 3: Finish the mobile visual system**

Define CSS tokens for surface, text, muted text, primary, danger, border, card radius and `env(safe-area-inset-bottom)`. Use a centered shell capped at 430px, 44px minimum touch targets, fixed safe-area-aware bottom navigation, visible focus states, `100dvh` for full-screen editors and no color-only statuses. Keep audio controls reachable with one thumb and ensure error messages use `role="alert"`.

- [ ] **Step 4: Run the full release gate**

Run: `npm test -- --run && npm run build && npx playwright test`  
Expected: all unit tests PASS, production build succeeds, PWA reopens offline, and 375px/390px/430px layouts have no horizontal overflow.

- [ ] **Step 5: Commit the verified application**

Run: `git add src tests playwright.config.ts && git commit -m "test: verify mobile inspiration PWA"`

## Final acceptance checklist

- [ ] Text ideas survive refresh, browser restart and offline reopening.
- [ ] Supported phones record, pause, resume, preview and save non-empty audio.
- [ ] Unsupported speech recognition preserves audio and displays the agreed fallback.
- [ ] ZIP restores ideas, tags, transcripts and playable audio without partial imports.
- [ ] UI never exposes raw ISO timestamps, `Invalid Date`, milliseconds or timezone suffixes.
