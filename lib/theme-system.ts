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
    description: 'The classic cyber aesthetic with pink, purple, and cyan',
    colors: {
      primary: '#ec4899', // cyber-pink
      secondary: '#9146ff', // cyber-purple
      accent: '#67e8f9', // cyber-cyan
      background: 'rgba(255, 20, 147, 0.1)',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 20, 147, 0.2)',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #9146ff 50%, #67e8f9 100%)'
    },
    cssVariables: {
      '--theme-primary': '236 72 153',
      '--theme-secondary': '145 70 255', 
      '--theme-accent': '103 232 249',
      '--theme-background': 'rgba(255, 20, 147, 0.1)',
      '--theme-surface': 'rgba(255, 255, 255, 0.05)',
      '--theme-border': 'rgba(255, 20, 147, 0.2)'
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
      '--theme-background': 'rgba(244, 114, 182, 0.1)',
      '--theme-surface': 'rgba(255, 255, 255, 0.05)',
      '--theme-border': 'rgba(244, 114, 182, 0.2)'
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

export function getActiveTheme(userScheme?: string, seasonalEnabled?: boolean): ColorScheme {
  // If seasonal themes are enabled, check for current seasonal theme
  if (seasonalEnabled) {
    const currentSeason = getCurrentSeason()
    const seasonalTheme = seasonalThemes[currentSeason]
    
    if (seasonalTheme) {
      return {
        name: seasonalTheme.name,
        displayName: seasonalTheme.displayName,
        description: `Seasonal theme for ${seasonalTheme.displayName}`,
        colors: seasonalTheme.colors,
        cssVariables: {
          '--theme-primary': seasonalTheme.colors.primary.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(' ') || '236 72 153',
          '--theme-secondary': seasonalTheme.colors.secondary.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(' ') || '145 70 255',
          '--theme-accent': seasonalTheme.colors.accent.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(' ') || '103 232 249',
          '--theme-background': seasonalTheme.colors.background,
          '--theme-surface': seasonalTheme.colors.surface,
          '--theme-border': seasonalTheme.colors.border
        }
      }
    }
  }
  
  // Fall back to user's custom scheme or default
  return colorSchemes[userScheme || 'cyber-default'] || colorSchemes['cyber-default']
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
  
  // Add theme-aware background colors as CSS variables
  root.style.setProperty('--theme-bg-primary', theme.colors.primary)
  root.style.setProperty('--theme-bg-secondary', theme.colors.secondary)
  root.style.setProperty('--theme-bg-accent', theme.colors.accent)
  root.style.setProperty('--theme-page-background', theme.colors.background)
  
  // Update body background with theme colors for profile pages
  const isUsernamePage = window.location.pathname.startsWith('/') &&
    window.location.pathname.split('/').length === 2 &&
    window.location.pathname !== '/' &&
    !window.location.pathname.startsWith('/dashboard') &&
    !window.location.pathname.startsWith('/admin') &&
    !window.location.pathname.startsWith('/canvas') &&
    !window.location.pathname.startsWith('/overlay') &&
    !window.location.pathname.startsWith('/api') &&
    !window.location.pathname.includes('.') &&
    !window.location.pathname.startsWith('/about') &&
    !window.location.pathname.startsWith('/contact') &&
    !window.location.pathname.startsWith('/privacy') &&
    !window.location.pathname.startsWith('/terms')

  if (isUsernamePage) {
    // For username pages, apply the theme background directly
    body.style.background = `linear-gradient(135deg, ${theme.colors.primary}08, ${theme.colors.secondary}08, ${theme.colors.accent}08)`
    body.style.backgroundAttachment = 'fixed'
    console.log(`[Theme System] Applied custom background for username page: ${theme.colors.primary}`)
  }
  
  // Update data attribute for theme-specific styling
  root.setAttribute('data-theme', theme.name)
  
  console.log(`[Theme System] Theme applied successfully. Current data-theme: ${root.getAttribute('data-theme')}`)
}

export function generateThemeCSS(theme: ColorScheme): string {
  return `
    [data-theme="${theme.name}"] {
      ${Object.entries(theme.cssVariables).map(([prop, value]) => `${prop}: ${value};`).join('\n      ')}
    }
    
    [data-theme="${theme.name}"] .theme-primary {
      color: ${theme.colors.primary};
    }
    
    [data-theme="${theme.name}"] .theme-secondary {
      color: ${theme.colors.secondary};
    }
    
    [data-theme="${theme.name}"] .theme-accent {
      color: ${theme.colors.accent};
    }
    
    [data-theme="${theme.name}"] .theme-gradient {
      background: ${theme.colors.gradient};
    }
    
    [data-theme="${theme.name}"] .theme-bg {
      background: ${theme.colors.background};
    }
    
    [data-theme="${theme.name}"] .theme-surface {
      background: ${theme.colors.surface};
    }
    
    [data-theme="${theme.name}"] .theme-border {
      border-color: ${theme.colors.border};
    }
  `
}

// Helper function to convert hex to RGB values for Tailwind
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
    : '0 0 0'
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