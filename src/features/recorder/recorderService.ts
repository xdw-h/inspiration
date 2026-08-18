const AUDIO_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']

export interface RecordedAudio { blob: Blob; mimeType: string; size: number; durationMs: number }
type RecorderConstructor = typeof MediaRecorder

export function chooseAudioMimeType(supported: (type: string) => boolean = (type) => globalThis.MediaRecorder?.isTypeSupported(type) ?? false) {
  return AUDIO_TYPES.find((type) => supported(type)) ?? ''
}

function messageFor(error: unknown) {
  if (error instanceof DOMException && error.name === 'NotAllowedError') return '麦克风权限被拒绝，请在浏览器设置中允许后重试'
  if (error && typeof error === 'object' && 'name' in error && error.name === 'NotAllowedError') return '麦克风权限被拒绝，请在浏览器设置中允许后重试'
  return '无法启动录音，请确认麦克风未被其他应用占用'
}

export function createRecorderService(
  mediaDevices: Pick<MediaDevices, 'getUserMedia'> = navigator.mediaDevices,
  Recorder: RecorderConstructor | undefined = globalThis.MediaRecorder,
  onChunk?: (chunk: Blob) => void,
  options: { onInterrupted?: () => void } = {},
) {
  let recorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let chunks: Blob[] = []
  let startedAt = 0
  let pausedAt = 0
  let pausedDuration = 0
  let intentionalStop = false

  function release() { stream?.getTracks().forEach((track) => track.stop()); stream = null }
  return {
    async start() {
      if (!Recorder) throw new Error('当前浏览器不支持录音，请改用文字记录')
      try { stream = await mediaDevices.getUserMedia({ audio: true }) } catch (error) { throw new Error(messageFor(error)) }
      chunks = []; pausedDuration = 0; startedAt = Date.now()
      const mimeType = chooseAudioMimeType(Recorder.isTypeSupported.bind(Recorder))
      recorder = mimeType ? new Recorder(stream, { mimeType }) : new Recorder(stream)
      recorder.addEventListener('dataavailable', (event: BlobEvent) => { if (event.data.size) { chunks.push(event.data); onChunk?.(event.data) } })
      recorder.addEventListener('stop', () => { if (!intentionalStop) { release(); recorder = null; options.onInterrupted?.() } })
      recorder.start(1000)
    },
    pause() { if (recorder?.state === 'recording') { recorder.pause(); pausedAt = Date.now() } },
    resume() { if (recorder?.state === 'paused') { pausedDuration += Date.now() - pausedAt; recorder.resume() } },
    stop(): Promise<RecordedAudio> {
      return new Promise((resolve, reject) => {
        if (!recorder || recorder.state === 'inactive') { reject(new Error('当前没有正在进行的录音')); return }
        const active = recorder
        active.addEventListener('stop', () => {
          release()
          const mimeType = active.mimeType || chunks[0]?.type || 'audio/webm'
          const blob = new Blob(chunks, { type: mimeType })
          recorder = null
          if (!blob.size) { reject(new Error('没有录到声音，请重新录制')); return }
          resolve({ blob, mimeType, size: blob.size, durationMs: Math.max(0, Date.now() - startedAt - pausedDuration) })
        }, { once: true })
        intentionalStop = true; active.stop()
      })
    },
    cancel() { intentionalStop = true; if (recorder && recorder.state !== 'inactive') recorder.stop(); recorder = null; chunks = []; release() },
  }
}
