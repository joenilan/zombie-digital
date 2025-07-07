export interface ColorScheme {
  name: string
  displayName: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    border: string
    gradient: string
  }
  cssVariables: Record<string, string>
}

export interface SeasonalTheme {
  name: string
  displayName: string
  months: number[]
  colors: ColorScheme['colors']
  decorations?: {
    particles?: string
    overlay?: string
    effects?: string[]
  }
}

// Custom Color Schemes
export const colorSchemes: Record<string, ColorScheme> = {
  'cyber-default': {
    name: 'cyber-default',
    displayName: 'Cyber Default',
    description: 'The classic cyber aesthetic with pink primary, purple secondary, and cyan accents',
    colors: {
      primary: '#ec4899', // cyber-pink (restored as primary)
      secondary: '#9146ff', // cyber-purple
      accent: '#8df5ff', // light cyan (for borders and accents)
      background: 'rgba(236, 72, 153, 0.1)', // subtle pink background
      surface: 'rgba(255, 255, 255, 0.05)', // neutral glass surface
      border: 'rgba(141, 245, 255, 0.3)', // cyan borders as requested
      gradient: 'linear-gradient(135deg, #ec4899 0%, #9146ff 50%, #8df5ff 100%)'
    },
    cssVariables: {
      '--theme-primary': '236 72 153', // cyber-pink RGB (restored)
      '--theme-secondary': '145 70 255', // cyber-purple RGB
      '--theme-accent': '141 245 255', // light cyan RGB (for accents)
      '--theme-foreground': '255 255 255',
      '--theme-background': 'rgba(236, 72, 153, 0.1)', // subtle pink background
      '--theme-surface': 'rgba(255, 255, 255, 0.05)',
      '--theme-border': 'rgba(141, 245, 255, 0.3)', // cyan borders
      '--theme-border-primary': 'rgba(141, 245, 255, 0.6)', // stronger cyan borders
      '--theme-border-secondary': 'rgba(141, 245, 255, 0.4)', // medium cyan borders
      '--theme-border-accent': 'rgba(236, 72, 153, 0.4)', // pink accent borders
      '--theme-border-subtle': 'rgba(141, 245, 255, 0.2)', // subtle cyan borders
      '--theme-surface-primary': 'rgba(236, 72, 153, 0.1)', // pink surface
      '--theme-surface-secondary': 'rgba(145, 70, 255, 0.1)', // purple surface
      '--theme-surface-glass': 'rgba(255, 255, 255, 0.05)' // neutral glass
    }
  },
  
  'neon-retro': {
    name: 'neon-retro',
    displayName: 'Neon Retro',
    description: 'Vibrant 80s-inspired neon colors',
    colors: {
      primary: '#ff0080', // hot pink
      secondary: '#8000ff', // electric purple
      accent: '#00ff80', // neon green
      background: 'rgba(255, 0, 128, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 0, 128, 0.2)',
      gradient: 'linear-gradient(135deg, #ff0080 0%, #8000ff 50%, #00ff80 100%)'
    },
    cssVariables: {
      '--theme-primary': '255 0 128',
      '--theme-secondary': '128 0 255',
      '--theme-accent': '0 255 128',
      '--theme-foreground': '255 255 255',
      '--theme-background': 'rgba(255, 0, 128, 0.1)',
      '--theme-surface': 'rgba(255, 255, 255, 0.05)',
      '--theme-border': 'rgba(255, 0, 128, 0.2)'
    }
  },

  'ocean-depths': {
    name: 'ocean-depths',
    displayName: 'Ocean Depths',
    description: 'Deep blue and teal underwater vibes',
    colors: {
      primary: '#0ea5e9', // sky blue
      secondary: '#0d9488', // teal
      accent: '#06b6d4', // cyan
      background: 'rgba(14, 165, 233, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(14, 165, 233, 0.2)',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 50%, #06b6d4 100%)'
    },
    cssVariables: {
      '--theme-primary': '14 165 233',
      '--theme-secondary': '13 148 136',
      '--theme-accent': '6 182 212',
      '--theme-foreground': '255 255 255',
      '--theme-background': 'rgba(14, 165, 233, 0.1)',
      '--theme-surface': 'rgba(255, 255, 255, 0.05)',
      '--theme-border': 'rgba(14, 165, 233, 0.2)'
    }
  },

  'sunset-vibes': {
    name: 'sunset-vibes',
    displayName: 'Sunset Vibes',
    description: 'Warm orange, pink, and yellow sunset colors',
    colors: {
      primary: '#f97316', // orange
      secondary: '#ec4899', // pink
      accent: '#eab308', // yellow
      background: 'rgba(249, 115, 22, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(249, 115, 22, 0.2)',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #eab308 100%)'
    },
    cssVariables: {
      '--theme-primary': '249 115 22',
      '--theme-secondary': '236 72 153',
      '--theme-accent': '234 179 8',
      '--theme-foreground': '255 255 255',
      '--theme-background': 'rgba(249, 115, 22, 0.1)',
      '--theme-surface': 'rgba(255, 255, 255, 0.05)',
      '--theme-border': 'rgba(249, 115, 22, 0.2)'
    }
  },

  'forest-magic': {
    name: 'forest-magic',
    displayName: 'Forest Magic',
    description: 'Earthy greens with magical purple accents',
    colors: {
      primary: '#22c55e', // green
      secondary: '#8b5cf6', // violet
      accent: '#10b981', // emerald
      background: 'rgba(34, 197, 94, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(34, 197, 94, 0.2)',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #8b5cf6 50%, #10b981 100%)'
    },
    cssVariables: {
      '--theme-primary': '34 197 94',
      '--theme-secondary': '139 92 246',
      '--theme-accent': '16 185 129',
      '--theme-foreground': '255 255 255',
      '--theme-background': 'rgba(34, 197, 94, 0.1)',
      '--theme-surface': 'rgba(255, 255, 255, 0.05)',
      '--theme-border': 'rgba(34, 197, 94, 0.2)'
    }
  },

  'royal-purple': {
    name: 'royal-purple',
    displayName: 'Royal Purple',
    description: 'Luxurious purple and gold theme',
    colors: {
      primary: '#7c3aed', // violet
      secondary: '#fbbf24', // amber
      accent: '#a855f7', // purple
      background: 'rgba(124, 58, 237, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(124, 58, 237, 0.2)',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #fbbf24 50%, #a855f7 100%)'
    },
    cssVariables: {
      '--theme-primary': '124 58 237',
      '--theme-secondary': '251 191 36',
      '--theme-accent': '168 85 247',
      '--theme-foreground': '255 255 255',
      '--theme-background': 'rgba(124, 58, 237, 0.1)',
      '--theme-surface': 'rgba(255, 255, 255, 0.05)',
      '--theme-border': 'rgba(124, 58, 237, 0.2)'
    }
  },

  'cherry-blossom': {
    name: 'cherry-blossom',
    displayName: 'Cherry Blossom',
    description: 'Soft pink and white Japanese-inspired theme',
    colors: {
      primary: '#f472b6', // pink
      secondary: '#fb7185', // rose
      accent: '#fbbf24', // amber
      background: 'rgba(244, 114, 182, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(244, 114, 182, 0.2)',
      gradient: 'linear-gradient(135deg, #f472b6 0%, #fb7185 50%, #fbbf24 100%)'
    },
    cssVariables: {
      '--theme-primary': '244 114 182',
      '--theme-secondary': '251 113 133',
      '--theme-accent': '251 191 36',
      '--theme-foreground': '255 255 255',
      '--theme-background': 'rgba(244, 114, 182, 0.1)',
      '--theme-surface': 'rgba(255, 255, 255, 0.05)',
      '--theme-border': 'rgba(244, 114, 182, 0.2)'
    }
  },

  'custom': {
    name: 'custom',
    displayName: 'Custom Colors',
    description: 'Create your own custom color scheme',
    colors: {
      primary: '#ec4899', // default to cyber-pink
      secondary: '#9146ff', // default to cyber-purple
      accent: '#8df5ff', // default to light cyan
      background: 'rgba(236, 72, 153, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(141, 245, 255, 0.3)',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #9146ff 50%, #8df5ff 100%)'
    },
    cssVariables: {
      '--theme-primary': '236 72 153',
      '--theme-secondary': '145 70 255',
      '--theme-accent': '141 245 255',
      '--theme-foreground': '255 255 255',
      '--theme-background': 'rgba(236, 72, 153, 0.1)',
      '--theme-surface': 'rgba(255, 255, 255, 0.05)',
      '--theme-border': 'rgba(141, 245, 255, 0.3)',
      '--theme-border-primary': 'rgba(141, 245, 255, 0.6)',
      '--theme-border-secondary': 'rgba(141, 245, 255, 0.4)',
      '--theme-border-accent': 'rgba(236, 72, 153, 0.4)',
      '--theme-border-subtle': 'rgba(141, 245, 255, 0.2)',
      '--theme-surface-primary': 'rgba(236, 72, 153, 0.1)',
      '--theme-surface-secondary': 'rgba(145, 70, 255, 0.1)',
      '--theme-surface-glass': 'rgba(255, 255, 255, 0.05)'
    }
  }
}

// Seasonal Themes
export const seasonalThemes: Record<string, SeasonalTheme> = {
  'winter-frost': {
    name: 'winter-frost',
    displayName: 'Winter Frost',
    months: [12, 1, 2], // December, January, February
    colors: {
      primary: '#60a5fa', // blue
      secondary: '#e2e8f0', // slate
      accent: '#38bdf8', // sky
      background: 'rgba(96, 165, 250, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(96, 165, 250, 0.2)',
      gradient: 'linear-gradient(135deg, #60a5fa 0%, #e2e8f0 50%, #38bdf8 100%)'
    },
    decorations: {
      particles: 'snowflakes',
      overlay: 'frost-pattern',
      effects: ['sparkle', 'snow-drift']
    }
  },

  'spring-bloom': {
    name: 'spring-bloom',
    displayName: 'Spring Bloom',
    months: [3, 4, 5], // March, April, May
    colors: {
      primary: '#22c55e', // green
      secondary: '#f472b6', // pink
      accent: '#facc15', // yellow
      background: 'rgba(34, 197, 94, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(34, 197, 94, 0.2)',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #f472b6 50%, #facc15 100%)'
    },
    decorations: {
      particles: 'flower-petals',
      overlay: 'bloom-pattern',
      effects: ['gentle-breeze', 'petal-fall']
    }
  },

  'summer-energy': {
    name: 'summer-energy',
    displayName: 'Summer Energy',
    months: [6, 7, 8], // June, July, August
    colors: {
      primary: '#f97316', // orange
      secondary: '#facc15', // yellow
      accent: '#ef4444', // red
      background: 'rgba(249, 115, 22, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(249, 115, 22, 0.2)',
      gradient: 'linear-gradient(135deg, #f97316 0%, #facc15 50%, #ef4444 100%)'
    },
    decorations: {
      particles: 'sun-rays',
      overlay: 'heat-shimmer',
      effects: ['solar-flare', 'heat-wave']
    }
  },

  'autumn-harvest': {
    name: 'autumn-harvest',
    displayName: 'Autumn Harvest',
    months: [9, 10, 11], // September, October, November
    colors: {
      primary: '#ea580c', // orange-600
      secondary: '#dc2626', // red-600
      accent: '#ca8a04', // yellow-600
      background: 'rgba(234, 88, 12, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(234, 88, 12, 0.2)',
      gradient: 'linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #ca8a04 100%)'
    },
    decorations: {
      particles: 'falling-leaves',
      overlay: 'autumn-pattern',
      effects: ['leaf-drift', 'harvest-glow']
    }
  },

  // Holiday themes
  'halloween-spook': {
    name: 'halloween-spook',
    displayName: 'Halloween Spook',
    months: [10], // October only
    colors: {
      primary: '#f97316', // orange
      secondary: '#1f2937', // dark gray
      accent: '#8b5cf6', // purple
      background: 'rgba(249, 115, 22, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(249, 115, 22, 0.2)',
      gradient: 'linear-gradient(135deg, #f97316 0%, #1f2937 50%, #8b5cf6 100%)'
    },
    decorations: {
      particles: 'spooky-spirits',
      overlay: 'cobweb-pattern',
      effects: ['eerie-glow', 'phantom-drift']
    }
  },

  'christmas-magic': {
    name: 'christmas-magic',
    displayName: 'Christmas Magic',
    months: [12], // December only
    colors: {
      primary: '#dc2626', // red
      secondary: '#16a34a', // green
      accent: '#fbbf24', // gold
      background: 'rgba(220, 38, 38, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(220, 38, 38, 0.2)',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #16a34a 50%, #fbbf24 100%)'
    },
    decorations: {
      particles: 'snow-and-stars',
      overlay: 'festive-lights',
      effects: ['twinkle', 'festive-glow']
    }
  }
}

// Utility functions
export function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1
  
  for (const [key, theme] of Object.entries(seasonalThemes)) {
    if (theme.months.includes(month)) {
      return key
    }
  }
  
  return 'cyber-default'
}

// Helper function to convert hex to RGB values for Tailwind
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
    : '0 0 0'
}

// Generate a custom color scheme from user colors
export function generateCustomTheme(customColors: {
  primary: string
  secondary: string
  accent: string
}): ColorScheme {
  const { primary, secondary, accent } = customColors
  
  return {
    name: 'custom',
    displayName: 'Custom Colors',
    description: 'Your personalized color scheme',
    colors: {
      primary,
      secondary,
      accent,
      background: `rgba(${hexToRgb(primary)}, 0.1)`,
      surface: 'rgba(255, 255, 255, 0.05)',
      border: `rgba(${hexToRgb(accent)}, 0.3)`,
      gradient: `linear-gradient(135deg, ${primary} 0%, ${secondary} 50%, ${accent} 100%)`
    },
    cssVariables: {
      '--theme-primary': hexToRgb(primary),
      '--theme-secondary': hexToRgb(secondary),
      '--theme-accent': hexToRgb(accent),
      '--theme-foreground': '255 255 255',
      '--theme-background': `rgba(${hexToRgb(primary)}, 0.1)`,
      '--theme-surface': 'rgba(255, 255, 255, 0.05)',
      '--theme-border': `rgba(${hexToRgb(accent)}, 0.3)`,
      '--theme-border-primary': `rgba(${hexToRgb(accent)}, 0.6)`,
      '--theme-border-secondary': `rgba(${hexToRgb(accent)}, 0.4)`,
      '--theme-border-accent': `rgba(${hexToRgb(primary)}, 0.4)`,
      '--theme-border-subtle': `rgba(${hexToRgb(accent)}, 0.2)`,
      '--theme-surface-primary': `rgba(${hexToRgb(primary)}, 0.1)`,
      '--theme-surface-secondary': `rgba(${hexToRgb(secondary)}, 0.1)`,
      '--theme-surface-glass': 'rgba(255, 255, 255, 0.05)'
    }
  }
}

// Parse custom colors from theme_scheme if it contains custom color data
export function parseCustomColors(themeScheme?: string): {
  primary: string
  secondary: string
  accent: string
} | null {
  if (!themeScheme) return null
  
  // Handle new compact format: p123456s789abcadef123
  if (themeScheme.startsWith('p') && themeScheme.includes('s') && themeScheme.includes('a')) {
    try {
      const primaryMatch = themeScheme.match(/^p([0-9a-fA-F]{6})/)
      const secondaryMatch = themeScheme.match(/s([0-9a-fA-F]{6})/)
      const accentMatch = themeScheme.match(/a([0-9a-fA-F]{6})/)
      
      if (primaryMatch && secondaryMatch && accentMatch) {
        return {
          primary: `#${primaryMatch[1]}`,
          secondary: `#${secondaryMatch[1]}`,
          accent: `#${accentMatch[1]}`
        }
      }
    } catch (error) {
      console.warn('Failed to parse compact custom colors from theme_scheme:', error)
    }
  }
  
  // Handle legacy JSON format for backward compatibility
  if (themeScheme.startsWith('{')) {
    try {
      const parsed = JSON.parse(themeScheme)
      if (parsed.primary && parsed.secondary && parsed.accent) {
        return {
          primary: parsed.primary,
          secondary: parsed.secondary,
          accent: parsed.accent
        }
      }
    } catch (error) {
      console.warn('Failed to parse JSON custom colors from theme_scheme:', error)
    }
  }
  
  return null
}

// Updated getActiveTheme function to handle custom colors
export function getActiveTheme(userScheme?: string, seasonalEnabled?: boolean, customColors?: { primary: string; secondary: string; accent: string }): ColorScheme {
  // If custom colors are provided, generate a custom theme
  if (customColors) {
    return generateCustomTheme(customColors)
  }
  
  // Try to parse custom colors from userScheme if it's JSON
  const parsedCustomColors = parseCustomColors(userScheme)
  if (parsedCustomColors) {
    return generateCustomTheme(parsedCustomColors)
  }
  
  // Always start with user's custom scheme or default
  const baseTheme = colorSchemes[userScheme || 'cyber-default'] || colorSchemes['cyber-default']
  
  // If seasonal themes are enabled, only add decorative effects, not override colors
  if (seasonalEnabled) {
    const currentSeason = getCurrentSeason()
    const seasonalTheme = seasonalThemes[currentSeason]
    
    if (seasonalTheme) {
      // Return base theme with seasonal decorations but keep base colors
      return {
        ...baseTheme,
        displayName: `${baseTheme.displayName} (${seasonalTheme.displayName})`,
        description: `${baseTheme.description} with ${seasonalTheme.displayName.toLowerCase()} decorations`
      }
    }
  }
  
  // Return the base theme without any seasonal modifications
  return baseTheme
}

// Apply theme to a specific container instead of global DOM
export function applyThemeToContainer(container: HTMLElement, theme: ColorScheme) {
  if (typeof window === 'undefined') return // Skip on server
  
  console.log(`[Theme System] Applying theme to container: ${theme.name}`, theme.colors)
  
  // Apply ALL CSS custom properties from the theme (including enhanced ones for cyber-default)
  Object.entries(theme.cssVariables).forEach(([property, value]) => {
    container.style.setProperty(property, value)
  })
  
  // For themes that don't have enhanced variables, add fallback enhanced theme variables
  if (!theme.cssVariables['--theme-border-primary']) {
    // Add enhanced theme-aware CSS variables with better contrast
    container.style.setProperty('--theme-bg-primary', theme.colors.primary)
    container.style.setProperty('--theme-bg-secondary', theme.colors.secondary)
    container.style.setProperty('--theme-bg-accent', theme.colors.accent)
    container.style.setProperty('--theme-page-background', theme.colors.background)
    
    // Enhanced border variables with MUCH better visibility - using actual color values
    container.style.setProperty('--theme-border-primary', `${theme.colors.primary}99`) // 60% opacity in hex
    container.style.setProperty('--theme-border-secondary', `${theme.colors.secondary}80`) // 50% opacity in hex  
    container.style.setProperty('--theme-border-accent', `${theme.colors.accent}80`) // 50% opacity in hex
    container.style.setProperty('--theme-border-subtle', `${theme.colors.primary}40`) // 25% opacity in hex
    
    // Enhanced surface variables with much stronger visibility
    container.style.setProperty('--theme-surface-primary', `${theme.colors.primary}26`) // 15% opacity in hex
    container.style.setProperty('--theme-surface-secondary', `${theme.colors.secondary}1F`) // 12% opacity in hex
    container.style.setProperty('--theme-surface-glass', `${theme.colors.primary}14`) // 8% opacity in hex
  }
  
  // NOTE: We don't set data-theme attribute to avoid conflicts with dark mode CSS
  // Our custom CSS properties handle all the theming we need
  
  console.log(`[Theme System] Theme applied to container successfully. Using CSS custom properties only.`)
}

export function applyThemeToDOM(theme: ColorScheme) {
  if (typeof window === 'undefined') return // Skip on server
  
  const root = document.documentElement
  const body = document.body
  
  console.log(`[Theme System] Applying theme: ${theme.name}`, theme.colors)
  
  // Apply CSS custom properties
  Object.entries(theme.cssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
  
  // Add enhanced theme-aware CSS variables with better contrast
  root.style.setProperty('--theme-bg-primary', theme.colors.primary)
  root.style.setProperty('--theme-bg-secondary', theme.colors.secondary)
  root.style.setProperty('--theme-bg-accent', theme.colors.accent)
  root.style.setProperty('--theme-page-background', theme.colors.background)
  
  // Enhanced border variables with MUCH better visibility - using actual color values
  root.style.setProperty('--theme-border-primary', `${theme.colors.primary}99`) // 60% opacity in hex
  root.style.setProperty('--theme-border-secondary', `${theme.colors.secondary}80`) // 50% opacity in hex  
  root.style.setProperty('--theme-border-accent', `${theme.colors.accent}80`) // 50% opacity in hex
  root.style.setProperty('--theme-border-subtle', `${theme.colors.primary}40`) // 25% opacity in hex
  
  // Enhanced surface variables with much stronger visibility
  root.style.setProperty('--theme-surface-primary', `${theme.colors.primary}26`) // 15% opacity in hex
  root.style.setProperty('--theme-surface-secondary', `${theme.colors.secondary}1F`) // 12% opacity in hex
  root.style.setProperty('--theme-surface-glass', `${theme.colors.primary}14`) // 8% opacity in hex
  
  // Debug current URL and path
  const currentPath = window.location.pathname
  console.log(`[Theme System] Current URL path: ${currentPath}`)
  
  // Update body background with theme colors for profile pages
  const isUsernamePage = currentPath.startsWith('/') &&
    currentPath.split('/').length === 2 &&
    currentPath !== '/' &&
    !currentPath.startsWith('/dashboard') &&
    !currentPath.startsWith('/admin') &&
    !currentPath.startsWith('/canvas') &&
    !currentPath.startsWith('/overlay') &&
    !currentPath.startsWith('/api') &&
    !currentPath.includes('.') &&
    !currentPath.startsWith('/about') &&
    !currentPath.startsWith('/contact') &&
    !currentPath.startsWith('/privacy') &&
    !currentPath.startsWith('/terms')

  console.log(`[Theme System] Username page detection:`, {
    path: currentPath,
    isUsernamePage,
    pathParts: currentPath.split('/'),
    pathLength: currentPath.split('/').length
  })

  if (isUsernamePage) {
    console.log(`[Theme System] APPLYING background to username page: ${currentPath}`)
    
    // For username pages, apply the theme background with balanced colors
    // For cyber-default: subtle pink primary with cyan accents, not overwhelming cyan
    const newBackground = `
      linear-gradient(135deg, 
        ${theme.colors.primary}40 0%, 
        ${theme.colors.secondary}35 30%, 
        ${theme.colors.accent}45 70%,
        ${theme.colors.primary}30 100%
      ), 
      radial-gradient(circle at 20% 80%, ${theme.colors.accent}40, transparent 70%),
      radial-gradient(circle at 80% 20%, ${theme.colors.primary}35, transparent 70%),
      radial-gradient(circle at 40% 40%, ${theme.colors.secondary}30, transparent 70%),
      radial-gradient(circle at 60% 70%, ${theme.colors.accent}25, transparent 60%),
      radial-gradient(circle at 30% 10%, ${theme.colors.primary}20, transparent 50%),
      linear-gradient(180deg, #000000 0%, #0f0f0f 100%)
    `
    
    body.style.background = newBackground
    body.style.backgroundAttachment = 'fixed'
    body.style.backgroundBlendMode = 'normal'
    
    // Add some dynamic background properties
    root.style.setProperty('--theme-bg-animated', newBackground)
    
    console.log(`[Theme System] Applied ENHANCED background for username page:`, {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent,
      backgroundPreview: `linear-gradient(135deg, ${theme.colors.primary}40, ${theme.colors.secondary}35, ${theme.colors.accent}40)`,
      fullBackground: newBackground,
      bodyStyleBackground: body.style.background
    })
  } else {
    console.log(`[Theme System] NOT a username page, skipping background application`)
    // Reset background for non-profile pages
    body.style.background = ''
    body.style.backgroundAttachment = ''
  }
  
  // NOTE: We don't set data-theme attribute to avoid conflicts with dark mode CSS
  // Our custom CSS properties handle all the theming we need
  
  console.log(`[Theme System] Theme applied successfully. Using CSS custom properties only.`)
}

export function generateThemeCSS(theme: ColorScheme): string {
  // NOTE: We use CSS custom properties instead of data-theme selectors
  // to avoid conflicts with dark mode CSS frameworks
  return `
    .theme-container {
      ${Object.entries(theme.cssVariables).map(([prop, value]) => `${prop}: ${value};`).join('\n      ')}
    }
    
    .theme-container .theme-primary {
      color: ${theme.colors.primary};
    }
    
    .theme-container .theme-secondary {
      color: ${theme.colors.secondary};
    }
    
    .theme-container .theme-accent {
      color: ${theme.colors.accent};
    }
    
    .theme-container .theme-gradient {
      background: ${theme.colors.gradient};
    }
    
    .theme-container .theme-bg {
      background: ${theme.colors.background};
    }
    
    .theme-container .theme-surface {
      background: ${theme.colors.surface};
    }
    
    .theme-container .theme-border {
      border-color: ${theme.colors.border};
    }
  `
}

// Get theme-specific class names
export function getThemeClasses(theme: ColorScheme) {
  return {
    primary: `text-[${theme.colors.primary}]`,
    secondary: `text-[${theme.colors.secondary}]`,
    accent: `text-[${theme.colors.accent}]`,
    primaryBg: `bg-[${theme.colors.primary}]/20`,
    secondaryBg: `bg-[${theme.colors.secondary}]/20`,
    accentBg: `bg-[${theme.colors.accent}]/20`,
    primaryBorder: `border-[${theme.colors.primary}]/30`,
    secondaryBorder: `border-[${theme.colors.secondary}]/30`,
    accentBorder: `border-[${theme.colors.accent}]/30`,
    gradient: 'theme-gradient'
  }
} 