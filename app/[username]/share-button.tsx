"use client"

import { Share2 } from 'lucide-react'
import { ViewButton } from '@/components/ui/action-button'

import { useState } from 'react'

interface ShareButtonProps {
    username: string
    displayName: string
}

export function ShareButton({ username, displayName }: ShareButtonProps) {
    const [shared, setShared] = useState(false)

    const handleShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : `${process.env.NEXT_PUBLIC_BASE_URL}/${username}`

        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({
                    title: `${displayName}'s Profile`,
                    text: `Check out ${displayName}'s social links!`,
                    url: url
                })
                setShared(true)
                setTimeout(() => setShared(false), 2000)
            } else {
                // Fallback for browsers that don't support navigator.share
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    await navigator.clipboard.writeText(url)
                    setShared(true)
                    setTimeout(() => setShared(false), 2000)
                }
            }
        } catch (error) {
            console.error('Error sharing:', error)
        }
    }

    return (
        <ViewButton
            size="icon"
            className="rounded-full h-8 w-8"
            tooltip={shared ? "Copied!" : "Share Profile"}
            onClick={handleShare}
        >
            <Share2 size={16} />
        </ViewButton>
    )
} 