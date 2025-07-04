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
import { ThemeWrapper } from '@/components/theme-wrapper'

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
    icon_style?: string
    theme_scheme?: string
    seasonal_themes?: boolean
    updated_at?: string
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

    console.log('[ProfileContent] Rendering with theme:', {
        userTheme: profile.theme_scheme,
        seasonalThemes: profile.seasonal_themes,
        profileTimestamp: profile.updated_at || 'no timestamp',
        profile: profile
    })

    return (
        <ThemeWrapper
            userTheme={profile.theme_scheme}
            seasonalThemes={profile.seasonal_themes}
            iconStyle={profile.icon_style as any}
        >
            {/* Track page view */}
            <UmamiTracker userId={profile.user_id} isOwner={isOwner} />

            {/* Main Content Card */}
            <div className="max-w-2xl mx-auto relative">
                <div
                    className="backdrop-blur-xl rounded-xl overflow-hidden"
                    style={isTransparent ? {} : {
                        backgroundColor: `var(--theme-surface-glass)`,
                        borderColor: `var(--theme-border-primary)`,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        boxShadow: `
                            0 0 40px rgba(var(--theme-primary), 0.4),
                            0 0 80px rgba(var(--theme-accent), 0.2),
                            0 8px 32px rgba(var(--theme-primary), 0.3),
                            inset 0 1px 0 rgba(var(--theme-accent), 0.2)
                        `
                    }}
                >
                    {/* Card Background */}
                    <RealtimeBackground
                        userId={profile.user_id}
                        initialBackground={{
                            url: profile.background_media_url,
                            type: profile.background_media_type
                        }}
                    />

                    {/* Glass Overlay */}
                    <div
                        className={`absolute inset-0 ${isTransparent ? 'bg-transparent' : 'backdrop-blur-sm'}`}
                        style={isTransparent ? {} : {
                            backgroundColor: `rgba(var(--theme-background), 0.1)`
                        }}
                    />

                    {/* Content */}
                    <div className="relative space-y-8 p-6">
                        {/* Profile Header */}
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div
                                    className={`absolute inset-0 rounded-full animate-pulse blur-xl opacity-50 ${isTransparent ? '' : ''}`}
                                    style={isTransparent ? {} : {
                                        background: `linear-gradient(45deg, rgb(var(--theme-primary)), rgb(var(--theme-accent)))`
                                    }}
                                ></div>
                                <Image
                                    src={profile.profile_image_url}
                                    alt={profile.display_name}
                                    width={130}
                                    height={130}
                                    className="rounded-full relative"
                                    style={isTransparent ? {} : {
                                        borderColor: `var(--theme-border-primary)`,
                                        borderWidth: '4px',
                                        borderStyle: 'solid',
                                        boxShadow: `0 0 20px rgba(var(--theme-primary), 0.4), 0 0 40px rgba(var(--theme-accent), 0.2)`
                                    }}
                                    priority
                                />
                            </div>
                            <h1
                                className={`text-4xl font-bold mb-2 ${isTransparent ? 'text-white' : 'bg-clip-text text-transparent'}`}
                                style={isTransparent ? {} : {
                                    backgroundImage: `linear-gradient(45deg, rgb(var(--theme-primary)), rgb(var(--theme-accent)))`
                                }}
                            >
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
                            <div
                                className="rounded-lg p-4 backdrop-blur-sm"
                                style={{
                                    borderColor: `var(--theme-border-secondary)`,
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    backgroundColor: `var(--theme-surface-secondary)`,
                                    boxShadow: `0 4px 16px rgba(var(--theme-secondary), 0.2), 0 2px 8px rgba(var(--theme-accent), 0.1)`
                                }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: `rgba(var(--theme-accent), 0.6)` }}
                                    ></div>
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
                                iconStyle={profile.icon_style as any}
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
                                <span
                                    className="bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage: `linear-gradient(45deg, rgb(var(--theme-primary)), rgb(var(--theme-accent)))`
                                    }}
                                >
                                    Zombie
                                </span>
                                <span className="text-foreground/80">.Digital</span>
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </ThemeWrapper>
    )
} 