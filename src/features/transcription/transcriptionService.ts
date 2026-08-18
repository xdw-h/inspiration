interface RecognitionAlternativeLike { transcript: string }
interface RecognitionResultLike { isFinal: boolean; 0: RecognitionAlternativeLike; length: number }
interface RecognitionEventLike { resultIndex: number; results: ArrayLike<RecognitionResultLike> }
interface RecognitionLike {
  lang: string; continuous: boolean; interimResults: boolean
  onresult: ((event: RecognitionEventLike) => void) | null
  onerror: (() => void) | null; onend: (() => void) | null
  start(): void; stop(): void; abort(): void
}
type RecognitionConstructor = new () => RecognitionLike
type SpeechWindow = Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }

export function detectSpeechRecognition(target: Window = window): RecognitionConstructor | null {
  const speechWindow = target as SpeechWindow
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null
}

export function mergeTranscript(current: { text: string; manuallyEdited: boolean }, incoming: string) {
  return current.manuallyEdited ? current.text : incoming
}

export function createTranscriptionService(options: { onFinal: (text: string) => void; onInterim: (text: string) => void; onError: () => void; onEnd: () => void }, Constructor = detectSpeechRecognition()) {
  let recognition: RecognitionLike | null = null
  let finalText = ''
  return {
    supported: Boolean(Constructor),
    start() {
      if (!Constructor) return false
      finalText = ''
      recognition = new Constructor()
      recognition.lang = 'zh-CN'; recognition.continuous = true; recognition.interimResults = true
      recognition.onresult = (event) => {
        let interim = ''
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index]
          if (result.isFinal) finalText += result[0].transcript
          else interim += result[0].transcript
        }
        options.onInterim(interim)
        if (finalText) options.onFinal(finalText.trim())
      }
      recognition.onerror = () => options.onError()
      recognition.onend = () => options.onEnd()
      recognition.start()
      return true
    },
    stop() { recognition?.stop(); recognition = null },
    cancel() { recognition?.abort(); recognition = null },
  }
}
