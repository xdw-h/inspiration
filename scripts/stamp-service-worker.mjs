import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const workerPath = new URL('../dist/sw.js', import.meta.url)
const source = await readFile(workerPath, 'utf8')
if (!source.includes('__BUILD_VERSION__')) throw new Error('Service Worker 缺少构建版本占位符')
const version = createHash('sha256').update(source).update(String(Date.now())).digest('hex').slice(0, 12)
await writeFile(workerPath, source.replaceAll('__BUILD_VERSION__', version), 'utf8')
