'use client'

import { useEffect, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProfileStore } from '@/stores/useProfileStore'
import { logError } from '@/lib/debug'

interface OwnershipCheckerProps {
    username: string
    children: (isOwner: boolean) => React.ReactNode
}

export function OwnershipChecker({ username, children }: OwnershipCheckerProps) {
    const { user, isInitialized } = useAuthStore()
    const { isOwner, ownershipLoading, setIsOwner, setOwnershipLoading } = useProfileStore()
    const supabase = createClientComponentClient()

    // Memoize the ownership check to prevent unnecessary re-renders
    const shouldCheckOwnership = useMemo(() => {
        return isInitialized && user && username
    }, [isInitialized, user, username])

    useEffect(() => {
        async function checkOwnership() {
            if (!shouldCheckOwnership) {
                setOwnershipLoading(false)
                return
            }

            try {
                setOwnershipLoading(true)

                // Check if the current user owns this profile
                const { data: profileUser } = await supabase
                    .from('twitch_users')
                    .select('twitch_id')
                    .eq('username', username)
                    .single()

                if (profileUser && user) {
                    const ownershipResult = profileUser.twitch_id === user.twitch_id
                    setIsOwner(ownershipResult)
                } else {
                    setIsOwner(false)
                }
            } catch (error) {
                logError('Error checking ownership:', error)
                setIsOwner(false)
            } finally {
                setOwnershipLoading(false)
            }
        }

        checkOwnership()
    }, [shouldCheckOwnership, username, user, supabase, setIsOwner, setOwnershipLoading])

    // Don't render children until ownership check is complete
    if (ownershipLoading) {
        return null
    }

    return <>{children(isOwner)}</>
} 