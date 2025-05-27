'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function ViewTracker({ userId }: { userId: string }) {
    useEffect(() => {
        if (!userId) return

        const supabase = createClientComponentClient()
        let viewerId: string | null = null

        async function trackView() {
            try {
                // Get current user session (if any)
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    viewerId = session.user.id

                    // Don't count views if the profile owner is viewing their own profile
                    if (viewerId === userId) {
                        return
                    }
                }

                // Track the view via API
                const response = await fetch('/api/profile-view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        viewerId,
                        referrer: document.referrer || null,
                        userAgent: navigator.userAgent || null
                    })
                })

                if (!response.ok) {
                    console.error('Failed to track view:', await response.text())
                }
            } catch (error) {
                console.error('Error tracking profile view:', error)
            }
        }

        // Track the view after a short delay to avoid counting bounces
        const timeoutId = setTimeout(trackView, 5000)

        return () => clearTimeout(timeoutId)
    }, [userId]) // Only run when userId changes

    // This component doesn't render anything
    return null
} 