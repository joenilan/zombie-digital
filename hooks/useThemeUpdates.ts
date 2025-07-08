'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/useAuthStore'
import { useThemeStore, type IconStyle, type CustomColors } from '@/stores/useThemeStore'
import { debug, logError } from '@/lib/debug'

const supabase = createClientComponentClient()

export function useThemeUpdates() {
  const queryClient = useQueryClient()
  const { user, refreshUser } = useAuthStore()
  const { setIsUpdating, applyTheme, setIconStyle, setCustomColors } = useThemeStore()

  // Update color scheme mutation (handles both regular themes and custom colors)
  const updateColorSchemeMutation = useMutation({
    mutationFn: async ({ scheme, customColors }: { scheme: string; customColors?: CustomColors }) => {
      if (!user?.id) throw new Error('User not authenticated')

      debug.theme('[useThemeUpdates] Updating color scheme:', { scheme, customColors, userId: user.id })

      let themeSchemeValue = scheme

      // If it's a custom theme with colors, store as compact JSON string
      if (scheme === 'custom' && customColors) {
        // Use compact format: p=primary,s=secondary,a=accent (without # and quotes)
        themeSchemeValue = `p${customColors.primary.slice(1)}s${customColors.secondary.slice(1)}a${customColors.accent.slice(1)}`
      }

      const { error } = await supabase
        .from('twitch_users')
        .update({ theme_scheme: themeSchemeValue })
        .eq('id', user.id)

      if (error) {
        logError('Theme update error:', error)
        throw error
      }

      debug.theme('[useThemeUpdates] Color scheme updated successfully in database')
      return { scheme, customColors }
    },
    onMutate: () => {
      setIsUpdating(true)
    },
    onSuccess: async ({ scheme, customColors }) => {
      // Update local theme store immediately
      if (customColors) {
        setCustomColors(customColors)
      }
      applyTheme(scheme, undefined, customColors)
      
      // Refresh user data from auth store
      await refreshUser()
      
      // Invalidate any user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] })
      
      // Broadcast theme change to other tabs/windows
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('theme-update', JSON.stringify({
          type: 'color-scheme',
          scheme: scheme,
          customColors: customColors,
          timestamp: Date.now()
        }))
        // Clear the flag after a short delay
        setTimeout(() => {
          window.localStorage.removeItem('theme-update')
        }, 100)
      }
      
      toast.success(customColors ? 'Custom theme saved successfully!' : 'Theme updated successfully!')
    },
    onError: (error) => {
      logError('Theme update error:', error)
      toast.error('Failed to update theme')
    },
    onSettled: () => {
      setIsUpdating(false)
    }
  })

  // Toggle seasonal themes mutation
  const toggleSeasonalThemesMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!user?.id) throw new Error('User not authenticated')

      debug.theme('[useThemeUpdates] Toggling seasonal themes:', { enabled, userId: user.id })

      const { error } = await supabase
        .from('twitch_users')
        .update({ seasonal_themes: enabled })
        .eq('id', user.id)

      if (error) {
        logError('Seasonal themes update error:', error)
        throw error
      }

      debug.theme('[useThemeUpdates] Seasonal themes updated successfully in database')
      return enabled
    },
    onMutate: () => {
      setIsUpdating(true)
    },
    onSuccess: async (enabled) => {
      // Update local theme store immediately
      applyTheme(undefined, enabled)
      
      // Refresh user data from auth store
      await refreshUser()
      
      // Invalidate any user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] })
      
      // Broadcast theme change to other tabs/windows
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('theme-update', JSON.stringify({
          type: 'seasonal-themes',
          enabled: enabled,
          timestamp: Date.now()
        }))
        // Clear the flag after a short delay
        setTimeout(() => {
          window.localStorage.removeItem('theme-update')
        }, 100)
      }
      
      toast.success(`Seasonal themes ${enabled ? 'enabled' : 'disabled'}!`)
    },
    onError: (error) => {
      logError('Seasonal themes update error:', error)
      toast.error('Failed to update seasonal themes')
    },
    onSettled: () => {
      setIsUpdating(false)
    }
  })

  // Update icon style mutation
  const updateIconStyleMutation = useMutation({
    mutationFn: async (style: IconStyle) => {
      if (!user?.id) throw new Error('User not authenticated')

      debug.theme('[useThemeUpdates] Updating icon style:', { style, userId: user.id })

      const { error } = await supabase
        .from('twitch_users')
        .update({ icon_style: style })
        .eq('id', user.id)

      if (error) {
        logError('Icon style update error:', error)
        throw error
      }

      debug.theme('[useThemeUpdates] Icon style updated successfully in database')
      return style
    },
    onMutate: () => {
      setIsUpdating(true)
    },
    onSuccess: async (style) => {
      // Update local theme store immediately
      setIconStyle(style)
      
      // Refresh user data from auth store
      await refreshUser()
      
      // Invalidate any user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] })
      
      // Broadcast icon style change to other tabs/windows
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('theme-update', JSON.stringify({
          type: 'icon-style',
          style: style,
          timestamp: Date.now()
        }))
        // Clear the flag after a short delay
        setTimeout(() => {
          window.localStorage.removeItem('theme-update')
        }, 100)
      }
      
      toast.success('Icon style updated successfully!')
    },
    onError: (error) => {
      logError('Icon style update error:', error)
      toast.error('Failed to update icon style')
    },
    onSettled: () => {
      setIsUpdating(false)
    }
  })

  return {
    updateColorScheme: (scheme: string, customColors?: CustomColors) => 
      updateColorSchemeMutation.mutate({ scheme, customColors }),
    toggleSeasonalThemes: toggleSeasonalThemesMutation.mutate,
    updateIconStyle: updateIconStyleMutation.mutate,
    isUpdating: updateColorSchemeMutation.isPending || toggleSeasonalThemesMutation.isPending || updateIconStyleMutation.isPending
  }
} 