import { getPlatformColor } from '@/lib/icons'
import { type IconStyle } from '@/stores/useThemeStore'
import { type ColorScheme } from '@/lib/theme-system'
import { debug } from '@/lib/debug'

/**
 * Get icon styles based on the icon style setting
 */
export function getIconStyle(
  platform: string,
  iconStyle: IconStyle,
  activeTheme?: ColorScheme | null
): React.CSSProperties {
  switch (iconStyle) {
    case 'colored':
      return { color: getPlatformColor(platform) }
    case 'theme':
      debug.theme('getIconStyle', { platform, iconStyle, themeColor: activeTheme?.colors.primary })
      return activeTheme ? { color: activeTheme.colors.primary, fill: activeTheme.colors.primary } : {}
    case 'monochrome':
    default:
      return {} // Use default CSS colors (white/gray)
  }
}

/**
 * Get icon class name based on the icon style setting
 */
export function getIconClassName(
  baseClassName: string,
  iconStyle: IconStyle
): string {
  const classes = [baseClassName]
  
  if (iconStyle === 'monochrome') {
    classes.push('text-white/70 hover:text-white')
  }
  
  return classes.join(' ')
} 