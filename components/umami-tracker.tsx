'use client'

import { useEffect } from 'react'
import { umami } from '@/lib/umami'
import { logError } from '@/lib/debug'

interface UmamiTrackerProps {
    userId?: string
    isOwner?: boolean
}

export function UmamiTracker({ userId, isOwner }: UmamiTrackerProps) {
    useEffect(() => {
        // Don't track if user is viewing their own profile
        if (isOwner) return

        async function trackPageView() {
            try {
                await umami.initialize()
                await umami.trackPageView({
                    url: window.location.href,
                    title: document.title,
                    referrer: document.referrer || undefined
                })

                // Track custom event for profile view
                if (userId) {
                    await umami.trackEvent({
                        name: 'profile_view',
                        data: {
                            profile_id: userId,
                            page_type: 'profile'
                        }
                    })
                }
            } catch (error) {
                logError('Error tracking page view:', error)
            }
        }

        // Track after a short delay to avoid counting bounces
        const timeoutId = setTimeout(trackPageView, 3000)

        return () => clearTimeout(timeoutId)
    }, [userId, isOwner])

    // This component doesn't render anything
    return null
} 