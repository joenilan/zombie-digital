'use client'

import { useEffect, useState } from 'react'

export function ViewTracker({ userId, isOwner }: { userId: string; isOwner?: boolean }) {
    const [viewCounted, setViewCounted] = useState<boolean | null>(null)

    useEffect(() => {
        if (!userId) return

        async function trackView() {
            try {
                // Don't count views if the profile owner is viewing their own profile
                if (isOwner) {
                    return
                }

                // Track the view via API
                const response = await fetch('/api/profile-view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        viewerId: null, // We don't need to track the viewer ID for now
                        referrer: document.referrer || null,
                        userAgent: navigator.userAgent || null
                    })
                })

                if (!response.ok) {
                    console.error('Failed to track view:', await response.text())
                    return
                }

                const result = await response.json()
                setViewCounted(result.counted)

                // Optional: Log for debugging (remove in production)
                if (process.env.NODE_ENV === 'development') {
                    console.log('View tracking result:', result)
                }
            } catch (error) {
                console.error('Error tracking profile view:', error)
            }
        }

        // Track the view after a short delay to avoid counting bounces
        const timeoutId = setTimeout(trackView, 3000) // Reduced from 5s to 3s

        return () => clearTimeout(timeoutId)
    }, [userId, isOwner]) // Only run when userId or isOwner changes

    // This component doesn't render anything
    return null
} 