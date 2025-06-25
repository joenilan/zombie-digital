import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  applyThemeToDOM, 
  getActiveTheme, 
  colorSchemes, 
  seasonalThemes,
  getCurrentSeason,
  generateCustomTheme,
  parseCustomColors,
  type ColorScheme 
} from '@/lib/theme-system'

export type IconStyle = 'monochrome' | 'colored' | 'theme'

export interface CustomColors {
  primary: string
  secondary: string
  accent: string
}

interface ThemeState {
  // State
  currentScheme: string
  seasonalEnabled: boolean
  iconStyle: IconStyle
  previewScheme: string | null
  isUpdating: boolean
  customColors: CustomColors | null
  
  // Computed
  activeTheme: ColorScheme | null
  currentSeason: string
  
  // Actions
  setCurrentScheme: (scheme: string) => void
  setSeasonalEnabled: (enabled: boolean) => void
  setIconStyle: (style: IconStyle) => void
  setPreviewScheme: (scheme: string | null) => void
  setIsUpdating: (updating: boolean) => void
  setCustomColors: (colors: CustomColors | null) => void
  updateActiveTheme: () => void
  applyTheme: (scheme?: string, seasonal?: boolean, customColors?: CustomColors) => void
  previewColorScheme: (scheme: string | null) => void
  previewCustomColors: (colors: CustomColors | null) => void
  
  // Reset
  reset: () => void
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentScheme: 'cyber-default',
      seasonalEnabled: false,
      iconStyle: 'colored',
      previewScheme: null,
      isUpdating: false,
      customColors: null,
      activeTheme: null,
      currentSeason: getCurrentSeason(),
      
      // Actions
      setCurrentScheme: (scheme) => {
        set({ currentScheme: scheme })
        
        // If switching to custom, keep custom colors, otherwise clear them
        if (scheme !== 'custom') {
          set({ customColors: null })
        }
        
        get().updateActiveTheme()
      },
      
      setSeasonalEnabled: (enabled) => {
        set({ seasonalEnabled: enabled })
        get().updateActiveTheme()
      },
      
      setIconStyle: (style) => set({ iconStyle: style }),
      
      setPreviewScheme: (scheme) => set({ previewScheme: scheme }),
      
      setIsUpdating: (updating) => set({ isUpdating: updating }),
      
      setCustomColors: (colors) => {
        set({ customColors: colors })
        if (colors && get().currentScheme === 'custom') {
          get().updateActiveTheme()
        }
      },
      
      updateActiveTheme: () => {
        const { currentScheme, seasonalEnabled, customColors } = get()
        
        // Handle custom colors
        if (currentScheme === 'custom' && customColors) {
          const activeTheme = generateCustomTheme(customColors)
          set({ activeTheme })
          return
        }
        
        // Try to parse custom colors from scheme if it's JSON
        const parsedCustomColors = parseCustomColors(currentScheme)
        if (parsedCustomColors) {
          const activeTheme = generateCustomTheme(parsedCustomColors)
          set({ activeTheme, customColors: parsedCustomColors })
          return
        }
        
        // Use regular theme
        const activeTheme = getActiveTheme(currentScheme, seasonalEnabled)
        set({ activeTheme })
      },
      
      applyTheme: (scheme, seasonal, customColors) => {
        const state = get()
        const themeScheme = scheme || state.currentScheme
        const seasonalThemes = seasonal !== undefined ? seasonal : state.seasonalEnabled
        const colors = customColors || state.customColors
        
        let activeTheme: ColorScheme
        
        // Handle custom colors
        if (themeScheme === 'custom' && colors) {
          activeTheme = generateCustomTheme(colors)
        } else {
          // Try to parse custom colors from scheme if it's JSON
          const parsedCustomColors = parseCustomColors(themeScheme)
          if (parsedCustomColors) {
            activeTheme = generateCustomTheme(parsedCustomColors)
            set({ customColors: parsedCustomColors })
          } else {
            activeTheme = getActiveTheme(themeScheme, seasonalThemes)
          }
        }
        
        applyThemeToDOM(activeTheme)
        
        set({ 
          activeTheme,
          currentScheme: themeScheme,
          seasonalEnabled: seasonalThemes,
          customColors: colors
        })
      },
      
      previewColorScheme: (scheme) => {
        const { currentScheme, seasonalEnabled } = get()
        set({ previewScheme: scheme })
        
        if (scheme) {
          const previewTheme = getActiveTheme(scheme, seasonalEnabled)
          applyThemeToDOM(previewTheme)
        } else {
          // Reset to current theme
          get().updateActiveTheme()
          const { activeTheme } = get()
          if (activeTheme) {
            applyThemeToDOM(activeTheme)
          }
        }
      },
      
      previewCustomColors: (colors) => {
        if (colors) {
          const previewTheme = generateCustomTheme(colors)
          applyThemeToDOM(previewTheme)
        } else {
          // Reset to current theme
          get().updateActiveTheme()
          const { activeTheme } = get()
          if (activeTheme) {
            applyThemeToDOM(activeTheme)
          }
        }
      },
      
      reset: () => set({
        currentScheme: 'cyber-default',
        seasonalEnabled: false,
        iconStyle: 'colored',
        previewScheme: null,
        isUpdating: false,
        customColors: null,
        activeTheme: getActiveTheme('cyber-default', false),
        currentSeason: getCurrentSeason()
      })
    }),
    {
      name: 'theme-store', // name of the item in the storage (must be unique)
    }
  )
)

// Export available schemes for components
export { colorSchemes, seasonalThemes } 