import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { ProcessedEmoteData, generateEmoteFilename } from './emote-processor'
import { logError } from '@/lib/debug'

/**
 * Convert data URL to blob for better download handling
 */
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

/**
 * Download a single emote size
 */
export function downloadEmoteSize(dataURL: string, filename: string): void {
    const link = document.createElement('a')
    link.href = dataURL
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Download all sizes of a single emote as separate files
 */
export function downloadEmoteSizes(
  emote: ProcessedEmoteData,
  format: string = 'png'
): void {
  Object.entries(emote.sizes).forEach(([size, dataURL]) => {
    const filename = generateEmoteFilename(
      emote.originalFile.name,
      size,
      undefined,
      format
    )
    downloadEmoteSize(dataURL, filename)
  })
}

/**
 * Download a single emote variation
 */
export function downloadEmoteVariation(
  emote: ProcessedEmoteData,
  variationIndex: number,
  format: string = 'png'
): void {
  const variation = emote.variations?.[variationIndex]
  if (!variation) {
    logError('Variation not found')
    return
  }

  Object.entries(variation.sizes).forEach(([size, dataURL]) => {
    const filename = generateEmoteFilename(
      emote.originalFile.name,
      size,
      `hue${variation.hueShift}`,
      format
    )
    downloadEmoteSize(dataURL, filename)
  })
}

function isDataURL(url: string): boolean {
  return url.startsWith('data:');
}

async function urlToBlob(url: string): Promise<Blob> {
  if (isDataURL(url)) {
    return dataURLToBlob(url);
  } else {
    const response = await fetch(url, { mode: 'cors' });
    return await response.blob();
  }
}

/**
 * Create a ZIP archive with all emote sizes and variations
 */
export async function createEmoteZip(
  emotes: ProcessedEmoteData[],
  format: string = 'png'
): Promise<Blob> {
  const zip = new JSZip()

  for (const emote of emotes) {
    const baseName = emote.originalFile.name.replace(/\.[^/.]+$/, '')
    const emoteFolder = zip.folder(baseName)

    if (!emoteFolder) {
      logError(`Failed to create folder for ${baseName}`)
      continue
    }

    // Add main sizes
    const mainFolder = emoteFolder.folder('main')
    if (mainFolder) {
      for (const [size, dataURL] of Object.entries(emote.sizes)) {
        const filename = `${size}.${format}`
        const blob = await urlToBlob(dataURL)
        mainFolder.file(filename, blob)
      }
    }

    // Add variations if they exist
    if (emote.variations && emote.variations.length > 0) {
      const variationsFolder = emoteFolder.folder('variations')
      
      if (variationsFolder) {
        for (const variation of emote.variations) {
          // Add all sizes for this variation directly in variations folder
          for (const [size, dataURL] of Object.entries(variation.sizes)) {
            const filename = `${variation.name.toLowerCase().replace(' ', '_')}_${size}.${format}`
            const blob = await urlToBlob(dataURL)
            variationsFolder.file(filename, blob)
          }
        }
      }
    }
  }

  return await zip.generateAsync({ type: 'blob' })
}

/**
 * Download a single emote as a ZIP file
 */
export async function downloadEmoteAsZip(
  emote: ProcessedEmoteData,
  format: string = 'png'
): Promise<void> {
  try {
    const baseName = emote.originalFile.name.replace(/\.[^/.]+$/, '')
    const filename = `${baseName}_emote.zip`
    const zipBlob = await createEmoteZip([emote], format)
    saveAs(zipBlob, filename)
  } catch (error) {
    logError('Failed to create ZIP archive:', error)
    throw new Error('Failed to create download archive')
  }
}

/**
 * Download all processed emotes as a ZIP file
 */
export async function downloadEmotesAsZip(
  emotes: ProcessedEmoteData[],
  format: string = 'png',
  filename: string = 'twitch_emotes.zip'
): Promise<void> {
  try {
    const zipBlob = await createEmoteZip(emotes, format)
    saveAs(zipBlob, filename)
  } catch (error) {
    logError('Failed to create ZIP archive:', error)
    throw new Error('Failed to create download archive')
  }
}

/**
 * Create a summary of what will be included in the download
 */
export function getDownloadSummary(emotes: ProcessedEmoteData[]): {
  totalFiles: number
  totalEmotes: number
  totalVariations: number
  estimatedSize: string
} {
  let totalFiles = 0
  let totalVariations = 0

  for (const emote of emotes) {
    // Main sizes
    totalFiles += Object.keys(emote.sizes).length

    // Variations
    if (emote.variations) {
      totalVariations += emote.variations.length
      totalFiles += emote.variations.length * Object.keys(emote.variations[0]?.sizes || {}).length
    }
  }

  // Rough size estimation (assuming ~10KB per file average)
  const estimatedBytes = totalFiles * 10 * 1024
  const estimatedSize = estimatedBytes > 1024 * 1024 
    ? `${(estimatedBytes / (1024 * 1024)).toFixed(1)}MB`
    : `${(estimatedBytes / 1024).toFixed(0)}KB`

  return {
    totalFiles,
    totalEmotes: emotes.length,
    totalVariations,
    estimatedSize
  }
}

/**
 * Copy emote data URL to clipboard
 */
export async function copyEmoteToClipboard(dataURL: string): Promise<void> {
  try {
    const blob = dataURLToBlob(dataURL)
    const item = new ClipboardItem({ [blob.type]: blob })
    await navigator.clipboard.write([item])
  } catch (error) {
    logError('Failed to copy to clipboard:', error)
    throw new Error('Failed to copy emote to clipboard')
  }
}

/**
 * Share emote via Web Share API (if supported)
 */
export async function shareEmote(
  dataURL: string,
  filename: string,
  title: string = 'Check out this Twitch emote!'
): Promise<void> {
  if (!navigator.share) {
    throw new Error('Web Share API not supported')
  }

  try {
    const blob = dataURLToBlob(dataURL)
    const file = new File([blob], filename, { type: blob.type })
    
    await navigator.share({
      title,
      files: [file]
    })
  } catch (error) {
    logError('Failed to share emote:', error)
    throw new Error('Failed to share emote')
  }
}

/**
 * Generate a preview of the ZIP contents for user confirmation
 */
export function generateZipPreview(emotes: ProcessedEmoteData[]): {
  folders: {
    name: string
    files: string[]
  }[]
  summary: ReturnType<typeof getDownloadSummary>
} {
  const folders = []
  
  for (const emote of emotes) {
    const baseName = emote.originalFile.name.replace(/\.[^/.]+$/, '')
    const files = []

    // Main sizes
    files.push(...Object.keys(emote.sizes).map(size => `main/${size}.png`))

    // Variations
    if (emote.variations) {
      for (const variation of emote.variations) {
        files.push(...Object.keys(variation.sizes).map(size => 
          `variations/${variation.name.toLowerCase().replace(' ', '_')}_${size}.png`
        ))
      }
    }

    folders.push({
      name: baseName,
      files
    })
  }

  return {
    folders,
    summary: getDownloadSummary(emotes)
  }
}

// Re-export for convenience
export { generateEmoteFilename } 