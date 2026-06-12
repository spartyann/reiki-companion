import { Mp3Encoder } from '@breezystack/lamejs'
import { useFilesystem } from './useFilesystem'
import type { Theme } from '../types'
import { BELL_ASSETS } from '../types'

const SAMPLE_RATE = 44100
const MP3_BITRATE = 64
const CHANNELS = 1

export interface GenerationResult {
  path: string
  size: number
}

export function useAudioGenerator() {
  const { saveAudioFile } = useFilesystem()

  async function generateGongTrack(
    theme: Theme,
    onProgress?: (percent: number) => void
  ): Promise<GenerationResult> {
    const durationSeconds = theme.sessionDurationMinutes * 60

    onProgress?.(5)

    // Load and decode the bell audio file
    const bellUrl = resolveBellUrl(theme)
    const bellBuffer = await fetchAndDecodeAudio(bellUrl)

    onProgress?.(15)

    // Build the gong track via OfflineAudioContext
    const offlineCtx = new OfflineAudioContext(CHANNELS, SAMPLE_RATE * durationSeconds, SAMPLE_RATE)
    const bellTimes = computeBellTimes(durationSeconds, theme.bellIntervalSeconds)

    for (const t of bellTimes) {
      const source = offlineCtx.createBufferSource()
      source.buffer = bellBuffer
      source.connect(offlineCtx.destination)
      source.start(t)
    }

    onProgress?.(20)

    const rendered = await offlineCtx.startRendering()

    onProgress?.(50)

    // Encode to MP3 with progress yielding
    const mp3Data = await encodeMp3(rendered, (p) => onProgress?.(50 + p * 0.4))

    onProgress?.(92)

    const path = await saveAudioFile(theme.id, mp3Data)

    onProgress?.(100)

    return { path, size: mp3Data.byteLength }
  }

  return { generateGongTrack }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveBellUrl(theme: Theme): string {
  if (theme.bellAssetId === 'custom' && theme.bellCustomPath) {
    return theme.bellCustomPath
  }
  return BELL_ASSETS.find(a => a.id === theme.bellAssetId)?.path ?? BELL_ASSETS[0].path
}

async function fetchAndDecodeAudio(url: string): Promise<AudioBuffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Impossible de charger le fichier audio : ${url}`)
  const arrayBuffer = await response.arrayBuffer()
  const ctx = new AudioContext()
  const buffer = await ctx.decodeAudioData(arrayBuffer)
  await ctx.close()
  return buffer
}

function computeBellTimes(durationSeconds: number, intervalSeconds: number): number[] {
  const times: number[] = []
  for (let t = 0; t <= durationSeconds; t += intervalSeconds) {
    times.push(t)
  }
  const last = times[times.length - 1]
  // Add a final bell at session end if the last scheduled bell is more than 5 s early
  if (durationSeconds - last > 5) {
    times.push(durationSeconds - 0.5) // slightly before the very end
  }
  return times
}

async function encodeMp3(
  buffer: AudioBuffer,
  onProgress?: (fraction: number) => void
): Promise<Uint8Array> {
  const encoder = new Mp3Encoder(CHANNELS, buffer.sampleRate, MP3_BITRATE)
  const channelData = buffer.getChannelData(0)
  const chunks: Uint8Array[] = []
  const chunkSize = 1152
  const yieldEvery = 500 // yield to UI every N encoded chunks

  for (let i = 0; i < channelData.length; i += chunkSize) {
    const pcm = float32ToInt16(channelData.slice(i, Math.min(i + chunkSize, channelData.length)))
    const encoded = encoder.encodeBuffer(pcm)
    if (encoded.length > 0) chunks.push(new Uint8Array(encoded.buffer))

    const idx = Math.floor(i / chunkSize)
    if (idx % yieldEvery === 0) {
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      onProgress?.(i / channelData.length)
    }
  }

  const flushed = encoder.flush()
  if (flushed.length > 0) chunks.push(new Uint8Array(flushed.buffer))

  // Concatenate all chunks into one Uint8Array
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}

function float32ToInt16(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const clamped = Math.max(-1, Math.min(1, input[i]))
    output[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
  }
  return output
}
