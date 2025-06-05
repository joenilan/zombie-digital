'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function Footer() {
    const [isExpanded, setIsExpanded] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        // Pages where footer should never expand
        const isOverlayPage = pathname?.startsWith('/overlay/')
        const isCanvasEditorPage = pathname?.startsWith('/canvas/') && !pathname?.endsWith('/settings')

        if (isOverlayPage || isCanvasEditorPage) {
            setIsExpanded(false)
            return
        }

        let userHasScrolled = false

        const handleScroll = () => {
            // Mark that user has scrolled at least 100px
            if (!userHasScrolled && window.scrollY > 100) {
                userHasScrolled = true
            }

            // Only check for expansion if user has scrolled
            if (!userHasScrolled) {
                setIsExpanded(false)
                return
            }

            const { scrollTop, scrollHeight, clientHeight } = document.documentElement

            // Check if we're near the bottom (within 150px)
            const nearBottom = scrollTop + clientHeight >= scrollHeight - 150

            // Check if page has enough content to scroll
            const hasScrollableContent = scrollHeight > clientHeight + 200

            // Expand only if both conditions are met
            setIsExpanded(nearBottom && hasScrollableContent)
        }

        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true })

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [pathname])

    // Reset expansion when route changes
    useEffect(() => {
        setIsExpanded(false)
    }, [pathname])

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40">
            {/* Expanded section */}
            <div
                className="bg-background/90 backdrop-blur-xl border-t border-white/10 px-6 overflow-hidden transition-all duration-500 ease-out"
                style={{
                    height: isExpanded ? '180px' : '0px',
                    paddingTop: isExpanded ? '24px' : '0px',
                    paddingBottom: isExpanded ? '32px' : '0px',
                    opacity: isExpanded ? 1 : 0
                }}
            >
                <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-bold gradient-brand mb-3">
                            Zombie.Digital
                        </h3>
                        <p className="text-foreground/70 text-sm">
                            The ultimate platform for streamers and content creators.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-foreground font-semibold mb-3">Platform</h4>
                        <div className="space-y-2">
                            <Link href="/dashboard" className="block text-foreground/70 hover:text-foreground text-sm transition-colors">Dashboard</Link>
                            <Link href="/dashboard/social-links" className="block text-foreground/70 hover:text-foreground text-sm transition-colors">Social Links</Link>
                            <Link href="/dashboard/analytics" className="block text-foreground/70 hover:text-foreground text-sm transition-colors">Analytics</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-foreground font-semibold mb-3">Community</h4>
                        <div className="space-y-2">
                            <a href="https://discord.gg/tae47tGnGS" target="_blank" className="block text-foreground/70 hover:text-foreground text-sm transition-colors">Discord</a>
                            <a href="https://twitch.tv/dreadedzombie" target="_blank" className="block text-foreground/70 hover:text-foreground text-sm transition-colors">Twitch</a>
                            <a href="https://github.com/joenilan" target="_blank" className="block text-foreground/70 hover:text-foreground text-sm transition-colors">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Always visible compact footer */}
            <div className="bg-background/95 backdrop-blur-xl border-t border-white/5 px-6 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex gap-6">
                        <Link href="/about" className="text-foreground/70 hover:text-foreground text-sm transition-colors">About</Link>
                        <Link href="/contact" className="text-foreground/70 hover:text-foreground text-sm transition-colors">Contact</Link>
                        <Link href="/privacy" className="text-foreground/70 hover:text-foreground text-sm transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-foreground/70 hover:text-foreground text-sm transition-colors">Terms</Link>
                    </div>

                    <div className="flex gap-3">
                        <a href="https://twitch.tv/dreadedzombie" target="_blank" className="text-foreground/60 hover:text-foreground hover:scale-110 transition-all duration-200 p-2 rounded hover:bg-glass/20">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                            </svg>
                        </a>
                        <a href="https://x.com/dreadedzombietv" target="_blank" className="text-foreground/60 hover:text-foreground hover:scale-110 transition-all duration-200 p-2 rounded hover:bg-glass/20">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        <a href="https://github.com/joenilan" target="_blank" className="text-foreground/60 hover:text-foreground hover:scale-110 transition-all duration-200 p-2 rounded hover:bg-glass/20">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                        <a href="https://discord.gg/tae47tGnGS" target="_blank" className="text-foreground/60 hover:text-foreground hover:scale-110 transition-all duration-200 p-2 rounded hover:bg-glass/20">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
                            </svg>
                        </a>
                    </div>

                    <div className="text-foreground/50 text-sm">
                        © 2020-2025 Zombie.Digital. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    )
} 