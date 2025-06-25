'use client'

import { useEffect, useRef } from 'react'
import { useThemeStore, type IconStyle } from '@/stores/useThemeStore'
import { getActiveTheme, applyThemeToContainer } from '@/lib/theme-system'

interface ThemeWrapperProps {
    userTheme?: string | null
    seasonalThemes?: boolean | null
    iconStyle?: IconStyle | null
    children: React.ReactNode
}

export function ThemeWrapper({ userTheme, seasonalThemes, iconStyle, children }: ThemeWrapperProps) {
    const { setIconStyle } = useThemeStore()
    const containerRef = useRef<HTMLDivElement>(null)

    // Apply theme to container when props change (for real-time updates)
    useEffect(() => {
        console.log(`[ThemeWrapper] Theme props changed - applying to container:`, {
            userTheme,
            seasonalThemes,
            iconStyle,
            url: typeof window !== 'undefined' ? window.location.pathname : 'SSR'
        })

        if (typeof window !== 'undefined' && containerRef.current) {
            const theme = getActiveTheme(userTheme || 'cyber-default', seasonalThemes || false)
            applyThemeToContainer(containerRef.current, theme)
            setIconStyle(iconStyle || 'colored')
            console.log(`[ThemeWrapper] Theme applied to container for real-time update`)
        }
    }, [userTheme, seasonalThemes, iconStyle, setIconStyle]) // Re-run whenever theme props change

    // Also apply background to body for username pages only
    useEffect(() => {
        if (typeof window === 'undefined') return

        const currentPath = window.location.pathname
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

        if (isUsernamePage) {
            const theme = getActiveTheme(userTheme || 'cyber-default', seasonalThemes || false)
            const body = document.body

            // Apply background only
            const newBackground = `
                linear-gradient(135deg, 
                    ${theme.colors.primary}65 0%, 
                    ${theme.colors.secondary}55 30%, 
                    ${theme.colors.accent}65 70%,
                    ${theme.colors.primary}45 100%
                ), 
                radial-gradient(circle at 20% 80%, ${theme.colors.accent}55, transparent 70%),
                radial-gradient(circle at 80% 20%, ${theme.colors.primary}50, transparent 70%),
                radial-gradient(circle at 40% 40%, ${theme.colors.secondary}45, transparent 70%),
                radial-gradient(circle at 60% 70%, ${theme.colors.primary}40, transparent 60%),
                radial-gradient(circle at 30% 10%, ${theme.colors.accent}35, transparent 50%),
                linear-gradient(180deg, #000000 0%, #0f0f0f 100%)
            `

            body.style.background = newBackground
            body.style.backgroundAttachment = 'fixed'
            console.log(`[ThemeWrapper] Applied background for username page`)
        }

        // Cleanup function to reset background when component unmounts
        return () => {
            if (isUsernamePage) {
                const body = document.body
                body.style.background = ''
                body.style.backgroundAttachment = ''
                console.log(`[ThemeWrapper] Background reset on cleanup`)
            }
        }
    }, [userTheme, seasonalThemes])

    return (
        <div ref={containerRef} className="theme-container">
            {children}
        </div>
    )
} 