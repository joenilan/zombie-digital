export interface EmoteSize {
  width: number
  height: number
  label: string
}

export interface ProcessingOptions {
  hueShift?: number
  saturation?: number
  brightness?: number
  contrast?: number
  outputFormat?: 'png' | 'gif' | 'webp'
  quality?: number
}

export interface ProcessedEmoteData {
  id: string
  originalFile: File
  sizes: Record<string, string> // size -> base64 data URL
  variations?: {
    id: string
    name: string
    hueShift: number
    sizes: Record<string, string>
  }[]
}

// Standard Twitch emote sizes
export const TWITCH_EMOTE_SIZES: EmoteSize[] = [
  { width: 28, height: 28, label: '28x28' },
  { width: 56, height: 56, label: '56x56' },
  { width: 112, height: 112, label: '112x112' }
]

// Additional badge/sub tier sizes that might be useful
export const EXTENDED_SIZES: EmoteSize[] = [
  ...TWITCH_EMOTE_SIZES,
  { width: 18, height: 18, label: '18x18' },
  { width: 36, height: 36, label: '36x36' },
  { width: 72, height: 72, label: '72x72' }
]

export class EmoteProcessor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private originalImage: HTMLImageElement | null = null

  constructor() {
    // Create a temporary canvas element for processing
    this.canvas = document.createElement('canvas')
    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D context')
    }
    this.ctx = ctx
    
    // Enable image smoothing for better quality
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
  }

  /**
   * Load an image file and prepare it for processing
   */
  async loadImage(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const dataURL = e.target?.result as string
        const img = new Image()
        
        img.onload = () => {
          this.originalImage = img
          resolve()
        }
        
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = dataURL
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Apply CSS filters to the canvas context
   */
  private applyFilters(options: ProcessingOptions): void {
    const filters = []

    // Hue rotation
    if (options.hueShift && options.hueShift !== 0) {
      filters.push(`hue-rotate(${options.hueShift}deg)`)
    }

    // Saturation
    if (options.saturation !== undefined && options.saturation !== 100) {
      filters.push(`saturate(${options.saturation}%)`)
    }

    // Brightness
    if (options.brightness !== undefined && options.brightness !== 100) {
      filters.push(`brightness(${options.brightness}%)`)
    }

    // Contrast
    if (options.contrast !== undefined && options.contrast !== 100) {
      filters.push(`contrast(${options.contrast}%)`)
    }

    // Apply filters to context
    this.ctx.filter = filters.length > 0 ? filters.join(' ') : 'none'
  }

  /**
   * Resize and draw image to canvas with specified dimensions
   */
  private drawResizedImage(
    targetWidth: number, 
    targetHeight: number, 
    maintainAspect: boolean = true
  ): void {
    if (!this.originalImage) {
      throw new Error('No image loaded')
    }

    // Set canvas size
    this.canvas.width = targetWidth
    this.canvas.height = targetHeight

    // Clear canvas
    this.ctx.clearRect(0, 0, targetWidth, targetHeight)

    let drawWidth = targetWidth
    let drawHeight = targetHeight
    let offsetX = 0
    let offsetY = 0

    if (maintainAspect) {
      // Calculate scale to fit within target dimensions
      const scaleX = targetWidth / this.originalImage.width
      const scaleY = targetHeight / this.originalImage.height
      const scale = Math.min(scaleX, scaleY)

      drawWidth = this.originalImage.width * scale
      drawHeight = this.originalImage.height * scale

      // Center the image
      offsetX = (targetWidth - drawWidth) / 2
      offsetY = (targetHeight - drawHeight) / 2
    }

    // Draw the image
    this.ctx.drawImage(
      this.originalImage,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    )
  }

  /**
   * Convert canvas to data URL with specified format and quality
   */
  private canvasToDataURL(format: string = 'png', quality: number = 0.95): string {
    if (format === 'png') {
      return this.canvas.toDataURL('image/png')
    } else if (format === 'webp') {
      return this.canvas.toDataURL('image/webp', quality)
    } else if (format === 'gif') {
      // Canvas doesn't support GIF export directly
      // Convert to PNG for now
      return this.canvas.toDataURL('image/png')
    }
    
    return this.canvas.toDataURL('image/png')
  }

  /**
   * Process image to all specified sizes with proper filter application
   */
  async processToSizes(
    sizes: EmoteSize[] = TWITCH_EMOTE_SIZES, 
    options: ProcessingOptions = {}
  ): Promise<Record<string, string>> {
    if (!this.originalImage) {
      throw new Error('No image loaded')
    }

    const results: Record<string, string> = {}

    // If we have filters, we need to create a filtered version first
    if (this.hasFilters(options)) {
      // Create temporary canvas for filtered image
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')!
      
      tempCanvas.width = this.originalImage.width
      tempCanvas.height = this.originalImage.height
      
      // Apply filters to temp context
      this.applyFiltersToContext(tempCtx, options)
      
      // Draw original image with filters
      tempCtx.drawImage(this.originalImage, 0, 0)
      
      // Now process each size using the filtered image
      for (const size of sizes) {
        this.canvas.width = size.width
        this.canvas.height = size.height
        this.ctx.filter = 'none' // No filters on output canvas
        this.ctx.clearRect(0, 0, size.width, size.height)
        
        // Calculate scaling
        const scaleX = size.width / tempCanvas.width
        const scaleY = size.height / tempCanvas.height
        const scale = Math.min(scaleX, scaleY)
        
        const drawWidth = tempCanvas.width * scale
        const drawHeight = tempCanvas.height * scale
        const offsetX = (size.width - drawWidth) / 2
        const offsetY = (size.height - drawHeight) / 2
        
        // Draw scaled filtered image
        this.ctx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight)
        
        const dataURL = this.canvasToDataURL(options.outputFormat, options.quality)
        results[size.label] = dataURL
      }
    } else {
      // No filters, use original method
      for (const size of sizes) {
        this.drawResizedImage(size.width, size.height, true)
        const dataURL = this.canvasToDataURL(options.outputFormat, options.quality)
        results[size.label] = dataURL
      }
    }

    return results
  }

  /**
   * Check if any filters are applied
   */
  private hasFilters(options: ProcessingOptions): boolean {
    return !!(options.hueShift && options.hueShift !== 0) ||
           !!(options.saturation !== undefined && options.saturation !== 100) ||
           !!(options.brightness !== undefined && options.brightness !== 100) ||
           !!(options.contrast !== undefined && options.contrast !== 100)
  }

  /**
   * Apply filters to a specific context
   */
  private applyFiltersToContext(ctx: CanvasRenderingContext2D, options: ProcessingOptions): void {
    const filters = []

    // Hue rotation
    if (options.hueShift && options.hueShift !== 0) {
      filters.push(`hue-rotate(${options.hueShift}deg)`)
    }

    // Saturation
    if (options.saturation !== undefined && options.saturation !== 100) {
      filters.push(`saturate(${options.saturation}%)`)
    }

    // Brightness
    if (options.brightness !== undefined && options.brightness !== 100) {
      filters.push(`brightness(${options.brightness}%)`)
    }

    // Contrast
    if (options.contrast !== undefined && options.contrast !== 100) {
      filters.push(`contrast(${options.contrast}%)`)
    }

    // Apply filters to context
    ctx.filter = filters.length > 0 ? filters.join(' ') : 'none'
  }

  /**
   * Generate color variations by shifting hue
   */
  async generateColorVariations(
    variationCount: number = 6,
    baseOptions: ProcessingOptions = {},
    sizes: EmoteSize[] = TWITCH_EMOTE_SIZES
  ): Promise<{
    id: string
    name: string
    hueShift: number
    sizes: Record<string, string>
  }[]> {
    const variations = []
    
    // Calculate evenly distributed hue shifts across the color wheel
    const hueStep = 360 / variationCount
    const selectedHues = Array.from({ length: variationCount }, (_, i) => Math.round(i * hueStep))

    // Generate variations
    for (let i = 0; i < variationCount; i++) {
      const hueShift = selectedHues[i]
      const options: ProcessingOptions = {
        ...baseOptions,
        hueShift,
        saturation: 110, // Slight saturation boost
        brightness: 100
      }

      // Get color name based on hue
      const colorName = this.getColorName(hueShift)

      const id = `variation-${i}`
      const processedSizes = await this.processToSizes(sizes, options)
      
      variations.push({
        id,
        name: colorName,
        hueShift,
        sizes: processedSizes
      })
    }

    return variations
  }

  private getColorName(hue: number): string {
    // Map hue angles to color names
    const colorMap: [number, string][] = [
      [0, 'Red'],
      [15, 'Warm Red'],
      [30, 'Orange'],
      [45, 'Golden'],
      [60, 'Yellow'],
      [75, 'Lime'],
      [90, 'Spring Green'],
      [105, 'Bright Green'],
      [120, 'Green'],
      [135, 'Forest'],
      [150, 'Teal'],
      [165, 'Ocean'],
      [180, 'Cyan'],
      [195, 'Azure'],
      [210, 'Sky Blue'],
      [225, 'Royal Blue'],
      [240, 'Blue'],
      [255, 'Indigo'],
      [270, 'Purple'],
      [285, 'Violet'],
      [300, 'Pink'],
      [315, 'Rose'],
      [330, 'Magenta'],
      [345, 'Ruby']
    ]

    // Find the closest color name
    let closestColor = colorMap[0]
    let minDiff = 360

    for (const [colorHue, name] of colorMap) {
      const diff = Math.min(
        Math.abs(colorHue - hue),
        Math.abs(colorHue - (hue + 360)),
        Math.abs(colorHue - (hue - 360))
      )
      if (diff < minDiff) {
        minDiff = diff
        closestColor = [colorHue, name]
      }
    }

    return closestColor[1]
  }

  /**
   * Complete emote processing workflow
   */
  async processEmote(
    file: File,
    options: ProcessingOptions & {
      generateVariations?: boolean
      variationCount?: number
      sizes?: EmoteSize[]
    } = {}
  ): Promise<ProcessedEmoteData> {
    await this.loadImage(file)

    const sizes = options.sizes || TWITCH_EMOTE_SIZES
    const mainSizes = await this.processToSizes(sizes, options)

    const result: ProcessedEmoteData = {
      id: crypto.randomUUID(),
      originalFile: file,
      sizes: mainSizes
    }

    if (options.generateVariations && options.variationCount && options.variationCount > 0) {
      result.variations = await this.generateColorVariations(
        options.variationCount,
        options,
        sizes
      )
    }

    return result
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // Canvas cleanup
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.originalImage = null
  }
}

/**
 * Utility function to create a new emote processor
 */
export function createEmoteProcessor(): EmoteProcessor {
  return new EmoteProcessor()
}

/**
 * Process multiple files in batch
 */
export async function processBatchEmotes(
  files: File[],
  options: ProcessingOptions & {
    generateVariations?: boolean
    variationCount?: number
    sizes?: EmoteSize[]
  } = {}
): Promise<ProcessedEmoteData[]> {
  const results: ProcessedEmoteData[] = []
  
  for (const file of files) {
    const processor = createEmoteProcessor()
    try {
      const processed = await processor.processEmote(file, options)
      results.push(processed)
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error)
      // Continue with other files
    } finally {
      processor.dispose()
    }
  }

  return results
}

/**
 * Validate image file for emote processing
 */
export function validateEmoteFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please use PNG, JPEG, GIF, or WebP.'
    }
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.'
    }
  }

  return { valid: true }
}

/**
 * Generate download filename for processed emote
 */
export function generateEmoteFilename(
  originalName: string,
  size: string,
  variation?: string,
  format: string = 'png'
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '') // Remove extension
  const parts = [baseName]
  
  if (variation) {
    parts.push(variation)
  }
  
  parts.push(size)
  
  return `${parts.join('_')}.${format}`
} 