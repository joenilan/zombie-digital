'use client'

import { useEffect } from 'react'
import { getActiveTheme, applyThemeToDOM } from '@/lib/theme-system'

interface ThemeWrapperProps {
    userTheme?: string | null
    seasonalThemes?: boolean | null
    children: React.ReactNode
}

export function ThemeWrapper({ userTheme, seasonalThemes, children }: ThemeWrapperProps) {
    useEffect(() => {
        console.log(`[ThemeWrapper] Theme update triggered:`, {
            userTheme,
            seasonalThemes,
            url: typeof window !== 'undefined' ? window.location.pathname : 'SSR'
        })

        // Apply user's theme to the profile page with a small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            const activeTheme = getActiveTheme(userTheme || undefined, seasonalThemes || undefined)
            console.log(`[ThemeWrapper] Active theme determined:`, {
                name: activeTheme.name,
                colors: activeTheme.colors,
                userTheme,
                seasonalThemes
            })

            applyThemeToDOM(activeTheme)
            console.log(`[ThemeWrapper] Theme applied to DOM`)

            // Force a re-application after a short delay to overcome any conflicts
            setTimeout(() => {
                applyThemeToDOM(activeTheme)
                console.log(`[ThemeWrapper] Theme re-applied for robustness`)
            }, 100)
        }, 50)

        // Cleanup function to reset to default theme when component unmounts
        return () => {
            clearTimeout(timeoutId)
            console.log(`[ThemeWrapper] Cleaning up, resetting to default theme`)
            const defaultTheme = getActiveTheme('cyber-default', false)
            applyThemeToDOM(defaultTheme)

            // Reset body background to default when leaving profile page
            const body = document.body
            body.style.background = ''
            body.style.backgroundAttachment = ''
            console.log(`[ThemeWrapper] Body background reset to default`)
        }
    }, [userTheme, seasonalThemes])

    return <>{children}</>
} 