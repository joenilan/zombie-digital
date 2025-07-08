'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BackgroundUpload } from '@/components/background-upload'
import { RealtimeBackground } from './realtime-background'
import { ShareButton } from './share-button'
import { UmamiTracker } from '@/components/umami-tracker'
import { BioEditor } from '@/components/bio-editor'
import { ThemeWrapper } from '@/components/theme-wrapper'
import { EditButton } from '@/components/ui/action-button'
import { Edit } from '@/lib/icons'
import { getActiveTheme } from '@/lib/theme-system'
import { debug } from '@/lib/debug'

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

    // Compute the active theme for icon coloring
    const activeTheme = getActiveTheme(profile.theme_scheme, profile.seasonal_themes)

    // Normalize icon style value
    const allowedIconStyles = ['monochrome', 'colored', 'theme']
    const normalizedIconStyle = allowedIconStyles.includes(profile.icon_style as string)
        ? (profile.icon_style as 'monochrome' | 'colored' | 'theme')
        : 'colored'

    // Debug log for icon style
    debug.socialLinks('icon_style from profile', { icon_style: profile.icon_style, normalizedIconStyle });

    const handleBioUpdate = (newBio: string) => {
        setCurrentBio(newBio)
    }

    // Debug log for icon style
    debug.socialLinks('Rendering with theme', { userTheme: profile.theme_scheme, seasonalThemes: profile.seasonal_themes, profileTimestamp: profile.updated_at || 'no timestamp', profile });

    return (
        <ThemeWrapper
            userTheme={profile.theme_scheme}
            seasonalThemes={profile.seasonal_themes}
            iconStyle={normalizedIconStyle}
        >
            {/* Track page view */}
            <UmamiTracker userId={profile.user_id} isOwner={isOwner} />

            {/* Main Content Card */}
            <div className="max-w-[700px] w-full mx-auto relative">
                {/* Owner quick edit button */}
                {isOwner && !isTransparent && (
                    <Link href="/dashboard/social-links" className="absolute top-4 right-4 z-10">
                        <EditButton
                            size="icon"
                            tooltip="Edit your public page & links"
                            aria-label="Edit Public Page"
                        >
                            <Edit className="w-5 h-5" />
                        </EditButton>
                    </Link>
                )}
                <div
                    className="backdrop-blur-xl rounded-xl overflow-hidden border border-white/40 relative"
                    style={isTransparent ? {} : {
                        background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.2) 100%)`,
                        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)`
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

                    {/* Overlays above background, below content */}
                    {!isTransparent && (
                        <>
                            {/* Single theme-aware radial/linear gradient overlay (matches live preview) */}
                            <div
                                className="absolute inset-0 z-10 pointer-events-none select-none"
                                style={{
                                    background: `radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 70%, rgba(0, 0, 0, 0.8) 100%), linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(34,211,238,0.05) 100%)`
                                }}
                            />
                        </>
                    )}

                    {/* Content */}
                    <div className="relative z-30 space-y-6 p-4 sm:p-6">
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
                                    sizes="130px"
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

                        {/* Social Links */}
                        <div>
                            {/* The RealtimeLinks component was removed, so this section will be empty or need to be re-added */}
                            {/* For now, we'll just leave it empty as per the edit hint */}
                        </div>
                    </div>
                </div>

                {/* Footer (outside the card) */}
                {!isTransparent && (
                    <div className="text-center text-xs pt-4 opacity-70" style={{ color: `rgb(var(--theme-foreground))` }}>
                        <p>
                            Powered by{' '}
                            <Link href="/" className="font-bold inline-flex items-center transition-all duration-300 hover:opacity-100 hover:text-foreground">
                                <span
                                    className="bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage: `linear-gradient(45deg, rgb(var(--theme-primary)), rgb(var(--theme-accent)))`
                                    }}
                                >
                                    Zombie
                                </span>
                                <span className="opacity-80" style={{ color: `rgb(var(--theme-foreground))` }}>.Digital</span>
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </ThemeWrapper >
    )
} 