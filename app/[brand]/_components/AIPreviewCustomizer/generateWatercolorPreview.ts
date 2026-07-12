// ─── Mock AI generation ───────────────────────────────────────────────────────
// Clean async boundary so the real generation API can be dropped in without
// touching the component. For now it stylizes the uploaded photo on a canvas
// (a bold pop-art-ish saturation/contrast pass) after a short simulated delay.

export interface GenerationResult {
  previewUrl: string
}

const MIN_LATENCY_MS = 900

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('Could not read the selected file.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load the image.'))
    img.src = src
  })
}

async function stylizePhoto(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl)
  const W = Math.min(1000, img.naturalWidth || 1000)
  const H = Math.round((img.naturalHeight / img.naturalWidth) * W) || W
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  // Fill white first so transparent PNGs don't turn black in the JPEG output.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  // Pop-art look: punchy saturation + contrast, slightly lifted brightness.
  ctx.filter = 'saturate(1.9) contrast(1.3) brightness(1.05)'
  ctx.drawImage(img, 0, 0, W, H)
  return canvas.toDataURL('image/jpeg', 0.9)
}

/**
 * Generates the AI preview for an uploaded photo.
 * Swap the body for a real API call returning a hosted preview URL.
 */
export async function generateWatercolorPreview(file: File): Promise<GenerationResult> {
  const [dataUrl] = await Promise.all([
    fileToDataUrl(file),
    new Promise(resolve => setTimeout(resolve, MIN_LATENCY_MS)),
  ])
  const previewUrl = await stylizePhoto(dataUrl).catch(() => dataUrl)
  return { previewUrl }
}

/** Read a File to a data URL (kept alongside so callers store the original photo). */
export { fileToDataUrl }
