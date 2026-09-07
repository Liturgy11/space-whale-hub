import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { VIDEO_SOURCE_MAX, formatBytes, getFileExtension, isVideoFile } from '@/lib/media-types'

export { VIDEO_SOURCE_MAX }

/** Skip compression when already small enough for spoken-word clips. */
const SKIP_COMPRESS_UNDER = 45 * 1024 * 1024

let ffmpegInstance: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

async function getFFmpeg(onProgress?: (ratio: number) => void): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) {
    if (onProgress) {
      ffmpegInstance.on('progress', ({ progress }) => {
        onProgress(Math.min(1, Math.max(0, progress)))
      })
    }
    return ffmpegInstance
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      const ffmpeg = new FFmpeg()
      // Single-thread UMD core — works without COOP/COEP headers on Vercel
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      ffmpegInstance = ffmpeg
      return ffmpeg
    })()
  }

  const ffmpeg = await loadPromise
  if (onProgress) {
    ffmpeg.on('progress', ({ progress }) => {
      onProgress(Math.min(1, Math.max(0, progress)))
    })
  }
  return ffmpeg
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    const url = URL.createObjectURL(file)
    const cleanup = () => URL.revokeObjectURL(url)
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0
      cleanup()
      resolve(duration)
    }
    video.onerror = () => {
      cleanup()
      resolve(0)
    }
    video.src = url
  })
}

export async function shouldCompressVideo(file: File): Promise<boolean> {
  if (!isVideoFile(file)) return false
  if (file.size > SKIP_COMPRESS_UNDER) return true
  const duration = await getVideoDuration(file)
  // 2–3 min readings: compress even if somehow already under 45MB
  return duration >= 75
}

/**
 * Re-encode to H.264/AAC ~720p for spoken-word clips.
 * A 2–3 min reading usually lands around 30–70MB.
 */
export async function compressVideo(
  file: File,
  options?: { onProgress?: (ratio: number) => void; onStatus?: (message: string) => void }
): Promise<File> {
  if (!isVideoFile(file)) return file

  const needsCompress = await shouldCompressVideo(file)
  if (!needsCompress) {
    options?.onStatus?.('Video already small enough — uploading…')
    return file
  }

  options?.onStatus?.('Preparing video compressor (first time can take a moment)…')
  options?.onProgress?.(0)

  try {
    const ffmpeg = await getFFmpeg(options?.onProgress)
    options?.onStatus?.(`Compressing ${file.name} (${formatBytes(file.size)})…`)

    const ext = getFileExtension(file.name) || '.mp4'
    const inputName = `input${ext}`
    const outputName = 'output.mp4'

    await ffmpeg.writeFile(inputName, await fetchFile(file))
    await ffmpeg.exec([
      '-i', inputName,
      // Cap at 720p — plenty for poetry readings on the feed
      '-vf', "scale='min(1280,iw)':-2",
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '28',
      '-c:a', 'aac',
      '-b:a', '96k',
      '-ac', '1',
      '-movflags', '+faststart',
      '-y',
      outputName,
    ])

    const data = await ffmpeg.readFile(outputName)
    await ffmpeg.deleteFile(inputName).catch(() => {})
    await ffmpeg.deleteFile(outputName).catch(() => {})

    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data))
    // Copy into a fresh ArrayBuffer-backed Uint8Array for Blob Part typing
    const copy = new Uint8Array(bytes.byteLength)
    copy.set(bytes)
    const blob = new Blob([copy.buffer], { type: 'video/mp4' })
    const compressed = new File(
      [blob],
      file.name.replace(/\.[^.]+$/, '') + '-compressed.mp4',
      { type: 'video/mp4', lastModified: Date.now() }
    )

    if (compressed.size >= file.size * 0.95 && file.size <= SKIP_COMPRESS_UNDER * 1.5) {
      // Compression didn't help much and original was already reasonable
      options?.onStatus?.('Using original video…')
      return file.type === 'video/mp4' ? file : compressed
    }

    options?.onStatus?.(
      `Compressed ${formatBytes(file.size)} → ${formatBytes(compressed.size)}. Uploading…`
    )
    options?.onProgress?.(1)
    return compressed
  } catch (error) {
    console.error('Video compression failed:', error)
    options?.onStatus?.('Compression failed — trying original file…')
    // Fall back to original; caller still enforces upload size limit
    return file
  }
}
