'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { 
  applyThemeToDOM, 
  getActiveTheme, 
  colorSchemes, 
  seasonalThemes,
  getCurrentSeason,
  type ColorScheme,
  type SeasonalTheme
} from '@/lib/theme-system'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

const supabase = createClientComponentClient()

export function useThemeSystem() {
  const { user, refreshUser } = useAuthStore()
  const [isUpdating, setIsUpdating] = useState(false)
  const [previewScheme, setPreviewScheme] = useState<string | null>(null)

  // Initialize theme on mount and when user changes
  useEffect(() => {
    if (user) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        const activeTheme = getActiveTheme(user.theme_scheme || 'cyber-default', user.seasonal_themes ?? true)
        applyThemeToDOM(activeTheme)
      }, 50)
      
      return () => clearTimeout(timeoutId)
    }
  }, [user])

  // Update color scheme
  const updateColorScheme = useCallback(async (scheme: string) => {
    if (!user || isUpdating) return false

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('twitch_users')
        .update({ theme_scheme: scheme })
        .eq('twitch_id', user.twitch_id)

      if (error) {
        console.error('Theme update error:', error)
        toast.error('Failed to update theme')
        return false
      }

      // Refresh user data in auth store
      await refreshUser()
      
      // Apply the new theme immediately
      const activeTheme = getActiveTheme(scheme, user.seasonal_themes ?? true)
      applyThemeToDOM(activeTheme)
      
      toast.success('Theme updated successfully!')
      return true
    } catch (error) {
      console.error('Theme update error:', error)
      toast.error('Failed to update theme')
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [user, isUpdating, refreshUser])

  // Toggle seasonal themes
  const toggleSeasonalThemes = useCallback(async (enabled: boolean) => {
    if (!user || isUpdating) return false

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('twitch_users')
        .update({ seasonal_themes: enabled })
        .eq('twitch_id', user.twitch_id)

      if (error) {
        console.error('Seasonal themes update error:', error)
        toast.error('Failed to update seasonal themes')
        return false
      }

      // Refresh user data in auth store
      await refreshUser()
      
      // Apply the new theme immediately
      const activeTheme = getActiveTheme(user.theme_scheme || 'cyber-default', enabled)
      applyThemeToDOM(activeTheme)
      
      toast.success(`Seasonal themes ${enabled ? 'enabled' : 'disabled'}!`)
      return true
    } catch (error) {
      console.error('Seasonal themes update error:', error)
      toast.error('Failed to update seasonal themes')
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [user, isUpdating, refreshUser])

  // Preview scheme on hover
  const previewColorScheme = useCallback((scheme: string | null) => {
    if (!user) return
    
    setPreviewScheme(scheme)
    
    if (scheme) {
      const previewTheme = getActiveTheme(scheme, user.seasonal_themes ?? true)
      applyThemeToDOM(previewTheme)
    } else {
      // Reset to current theme
      const currentTheme = getActiveTheme(user.theme_scheme || 'cyber-default', user.seasonal_themes ?? true)
      applyThemeToDOM(currentTheme)
    }
  }, [user])

  // Get current active theme
  const getActiveThemeData = useCallback(() => {
    if (!user) return null
    return getActiveTheme(user.theme_scheme || 'cyber-default', user.seasonal_themes ?? true)
  }, [user])

  return {
    // State
    user,
    isUpdating,
    previewScheme,
    
    // Current theme info
    currentScheme: user?.theme_scheme || 'cyber-default',
    seasonalEnabled: user?.seasonal_themes ?? true,
    currentSeason: getCurrentSeason(),
    activeTheme: getActiveThemeData(),
    
    // Available options
    colorSchemes,
    seasonalThemes,
    
    // Actions
    updateColorScheme,
    toggleSeasonalThemes,
    previewColorScheme,
  }
} 