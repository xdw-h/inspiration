import { describe, expect, it } from 'vitest'
import { detectSpeechRecognition, mergeTranscript } from '../../src/features/transcription/transcriptionService'

describe('transcription fallback', () => {
  it('reports unsupported without throwing', () => expect(detectSpeechRecognition({} as Window)).toBeNull())
  it('does not overwrite manually edited text', () => {
    expect(mergeTranscript({ text: '人工修正', manuallyEdited: true }, '机器文本')).toBe('人工修正')
  })
  it('accepts machine text before manual editing', () => {
    expect(mergeTranscript({ text: '', manuallyEdited: false }, '机器文本')).toBe('机器文本')
  })
})
