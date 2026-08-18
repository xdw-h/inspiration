import JSZip from 'jszip'
import type { InspirationDatabase } from '../../shared/db/database'
import type { AudioAssetEntity } from '../ideas/types'
import type { AudioMetadata, BackupData, BackupManifest } from './types'

function blobBytes(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer().then((value) => new Uint8Array(value))
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(reader.error); reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer)); reader.readAsArrayBuffer(blob) })
}
function extension(mime: string) { if (mime.includes('mp4')) return 'm4a'; if (mime.includes('ogg')) return 'ogg'; if (mime.includes('wav')) return 'wav'; return 'webm' }

export async function exportBackup(database: InspirationDatabase) {
  const [ideas, tags, transcripts, audioAssets] = await Promise.all([database.ideas.toArray(), database.tags.toArray(), database.transcripts.toArray(), database.audioAssets.toArray()])
  const zip = new JSZip(); const audio: AudioMetadata[] = []
  for (const asset of audioAssets) { const file = `audio/${asset.id}.${extension(asset.mimeType)}`; zip.file(file, await blobBytes(asset.blob)); audio.push({ id: asset.id, ideaId: asset.ideaId, mimeType: asset.mimeType, size: asset.size, durationMs: asset.durationMs, createdAt: asset.createdAt, file }) }
  const manifest: BackupManifest = { version: 1, createdAt: new Date().toISOString(), ideas: ideas.length, audio: audio.length }
  zip.file('manifest.json', JSON.stringify(manifest, null, 2)); zip.file('ideas.json', JSON.stringify({ ideas, tags, transcripts, audio } satisfies BackupData, null, 2))
  const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  return new Blob([bytes as BlobPart], { type: 'application/zip' })
}

function validate(manifest: BackupManifest, data: BackupData) {
  if (manifest.version !== 1) throw new Error('备份版本不兼容')
  if (!Array.isArray(data.ideas) || !Array.isArray(data.tags) || !Array.isArray(data.transcripts) || !Array.isArray(data.audio)) throw new Error('备份数据结构错误')
  if (manifest.ideas !== data.ideas.length || manifest.audio !== data.audio.length) throw new Error('备份清单与内容不一致')
  const ideaIds = new Set(data.ideas.map((item) => item.id)); if (ideaIds.size !== data.ideas.length) throw new Error('备份包含重复的灵感 ID')
  if (data.audio.some((item) => !ideaIds.has(item.ideaId)) || data.transcripts.some((item) => !ideaIds.has(item.ideaId))) throw new Error('备份包含失效的灵感引用')
}

export async function importBackup(file: Blob, database: InspirationDatabase) {
  let zip: JSZip
  try { zip = await JSZip.loadAsync(await blobBytes(file)) } catch { throw new Error('备份文件损坏或格式不正确') }
  const manifestEntry = zip.file('manifest.json'); const dataEntry = zip.file('ideas.json')
  if (!manifestEntry || !dataEntry) throw new Error('备份文件损坏或格式不正确')
  let manifest: BackupManifest; let data: BackupData
  try { manifest = JSON.parse(await manifestEntry.async('string')); data = JSON.parse(await dataEntry.async('string')) } catch { throw new Error('备份文件损坏或格式不正确') }
  validate(manifest, data)
  const prepared: AudioAssetEntity[] = []
  for (const metadata of data.audio) { const entry = zip.file(metadata.file); if (!entry) throw new Error(`备份缺少音频：${metadata.id}`); const bytes = await entry.async('uint8array'); prepared.push({ ...metadata, blob: new Blob([bytes as BlobPart], { type: metadata.mimeType }) }) }
  let imported = 0; let skipped = 0; let audio = 0
  await database.transaction('rw', database.ideas, database.tags, database.transcripts, database.audioAssets, async () => {
    for (const tag of data.tags) await database.tags.put(tag)
    for (const idea of data.ideas) { if (await database.ideas.get(idea.id)) { skipped += 1; continue }; await database.ideas.add(idea); const relatedAudio = prepared.filter((item) => item.ideaId === idea.id); const relatedTranscripts = data.transcripts.filter((item) => item.ideaId === idea.id); if (relatedAudio.length) await database.audioAssets.bulkAdd(relatedAudio); if (relatedTranscripts.length) await database.transcripts.bulkPut(relatedTranscripts); imported += 1; audio += relatedAudio.length }
  })
  return { imported, skipped, audio }
}
