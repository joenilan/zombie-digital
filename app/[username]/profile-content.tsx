'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { RealtimeLinks } from './realtime-links'
import { BackgroundUpload } from '@/components/background-upload'
import { RealtimeBackground } from './realtime-background'
import { ShareButton } from './share-button'
import { UmamiTracker } from '@/components/umami-tracker'
import { BioEditor } from '@/components/bio-editor'

interface Profile {
    user_id: string
    username: string
    display_name: string
    profile_image_url: string
    description?: string
    created_at: string
    background_media_url: string | null
    background_media_type: string | null
    twitch_id: string
}

interface SocialLink {
    id: string
    user_id: string
    platform: string
    url: string
    title?: string
    order_index: number
    created_at?: string
    updated_at?: string
}

interface ProfileContentProps {
    profile: Profile
    initialLinks: SocialLink[]
    isTransparent: boolean
    isOwner: boolean
}

export function ProfileContent({ profile, initialLinks, isTransparent, isOwner }: ProfileContentProps) {
    const [currentBio, setCurrentBio] = useState(profile.description || '')

    const handleBioUpdate = (newBio: string) => {
        setCurrentBio(newBio)
    }

    return (
        <>
            {/* Track page view */}
            <UmamiTracker userId={profile.user_id} isOwner={isOwner} />

            {/* Main Content Card */}
            <div className="max-w-2xl mx-auto relative">
                <div className={`${isTransparent ? '' : 'bg-background/20'} backdrop-blur-xl rounded-xl shadow-glass overflow-hidden border border-white/10`}>
                    {/* Card Background */}
                    <RealtimeBackground
                        userId={profile.user_id}
                        initialBackground={{
                            url: profile.background_media_url,
                            type: profile.background_media_type
                        }}
                    />

                    {/* Glass Overlay */}
                    <div className={`absolute inset-0 ${isTransparent ? 'bg-transparent' : 'bg-black/20 backdrop-blur-sm'}`} />

                    {/* Content */}
                    <div className="relative space-y-8 p-6">
                        {/* Profile Header */}
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div className={`absolute inset-0 rounded-full ${isTransparent ? '' : 'bg-gradient-to-r from-cyber-pink to-cyber-cyan animate-pulse blur-xl opacity-50'}`}></div>
                                <Image
                                    src={profile.profile_image_url}
                                    alt={profile.display_name}
                                    width={130}
                                    height={130}
                                    className={`rounded-full relative ${isTransparent ? '' : 'border-4 border-background/50'}`}
                                    priority
                                />
                            </div>
                            <h1 className={`text-4xl font-bold mb-2 ${isTransparent ? 'text-white' : 'bg-clip-text text-transparent bg-gradient-to-r from-cyber-pink to-cyber-cyan'}`}>
                                {profile.display_name}
                            </h1>

                            {/* Username and Share buttons container */}
                            <div className="flex items-center justify-center gap-2 mb-8">
                                <p className="text-lg text-muted-foreground">@{profile.username}</p>

                                {!isTransparent && (
                                    <div className="flex items-center gap-2">
                                        <ShareButton username={profile.username} displayName={profile.display_name} />
                                    </div>
                                )}
                            </div>

                            {/* Bio Display */}
                            {currentBio && (
                                <div className="mb-6 w-full">
                                    {isOwner && !isTransparent ? (
                                        <BioEditor
                                            userId={profile.user_id}
                                            initialBio={currentBio}
                                            onBioUpdate={handleBioUpdate}
                                        />
                                    ) : (
                                        <p className="text-muted-foreground max-w-lg mx-auto font-body leading-relaxed whitespace-pre-wrap">
                                            {currentBio}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Add Bio prompt for owners when no bio exists */}
                            {!currentBio && isOwner && !isTransparent && (
                                <div className="mb-6 w-full">
                                    <BioEditor
                                        userId={profile.user_id}
                                        initialBio=""
                                        onBioUpdate={handleBioUpdate}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Background Manager (only shown to profile owner) */}
                        {isOwner && !isTransparent && (
                            <div className="border border-white/10 rounded-lg p-4 bg-glass/20 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full"></div>
                                    <span className="text-xs text-muted-foreground/80 font-medium">Owner Only</span>
                                </div>
                                <h2 className="text-sm font-medium mb-3 text-foreground/90">Background Settings</h2>
                                <BackgroundUpload
                                    userId={profile.user_id}
                                    showPreview={false}
                                />
                            </div>
                        )}

                        {/* Social Links */}
                        <div>
                            <RealtimeLinks
                                userId={profile.user_id}
                                initialLinks={initialLinks}
                                isOwner={isOwner && !isTransparent}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer (outside the card) */}
                {!isTransparent && (
                    <div className="text-center text-sm text-muted-foreground/60 pt-8">
                        <p>
                            Powered by{" "}
                            <Link href="/" className="font-bold inline-flex items-center transition-all duration-300 hover:opacity-100 hover:text-foreground">
                                <span className="gradient-brand">Zombie</span>
                                <span className="text-foreground/80">.Digital</span>
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </>
    )
} 