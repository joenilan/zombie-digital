'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, Keyboard, Search, Home, User, Settings, HelpCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'

interface Shortcut {
    key: string
    description: string
    action: () => void
    category: 'navigation' | 'actions' | 'general'
    requiresAuth?: boolean
}

interface KeyboardShortcutsProps {
    className?: string
}

export function KeyboardShortcuts({ className }: KeyboardShortcutsProps) {
    const [showHelp, setShowHelp] = useState(false)
    const [commandPalette, setCommandPalette] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const { user } = useAuthStore()

    const shortcuts: Shortcut[] = [
        // Navigation shortcuts
        {
            key: 'g h',
            description: 'Go to Homepage',
            action: () => router.push('/'),
            category: 'navigation'
        },
        {
            key: 'g d',
            description: 'Go to Dashboard',
            action: () => router.push('/dashboard'),
            category: 'navigation',
            requiresAuth: true
        },
        {
            key: 'g s',
            description: 'Go to Social Links',
            action: () => router.push('/dashboard/social-links'),
            category: 'navigation',
            requiresAuth: true
        },
        {
            key: 'g c',
            description: 'Go to Contact',
            action: () => router.push('/contact'),
            category: 'navigation'
        },
        {
            key: 'g a',
            description: 'Go to About',
            action: () => router.push('/about'),
            category: 'navigation'
        },

        // Action shortcuts
        {
            key: 'cmd+k',
            description: 'Open Command Palette',
            action: () => setCommandPalette(true),
            category: 'actions'
        },
        {
            key: 'r',
            description: 'Refresh Page',
            action: () => window.location.reload(),
            category: 'actions'
        },
        {
            key: 'b',
            description: 'Go Back',
            action: () => window.history.back(),
            category: 'actions'
        },

        // General shortcuts
        {
            key: '?',
            description: 'Show Keyboard Shortcuts',
            action: () => setShowHelp(true),
            category: 'general'
        },
        {
            key: 'esc',
            description: 'Close Dialogs',
            action: () => {
                setShowHelp(false)
                setCommandPalette(false)
            },
            category: 'general'
        }
    ]

    // Filter shortcuts based on auth status
    const availableShortcuts = shortcuts.filter(shortcut =>
        !shortcut.requiresAuth || user
    )

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement ||
                (event.target as HTMLElement)?.contentEditable === 'true'
            ) {
                return
            }

            const key = event.key.toLowerCase()
            const isCmd = event.metaKey || event.ctrlKey
            const isShift = event.shiftKey

            // Handle single key shortcuts
            if (!isCmd && !isShift) {
                switch (key) {
                    case '?':
                        event.preventDefault()
                        setShowHelp(true)
                        break
                    case 'escape':
                        event.preventDefault()
                        setShowHelp(false)
                        setCommandPalette(false)
                        break
                    case 'r':
                        if (!event.target || (event.target as HTMLElement).tagName !== 'INPUT') {
                            event.preventDefault()
                            window.location.reload()
                        }
                        break
                    case 'b':
                        if (!event.target || (event.target as HTMLElement).tagName !== 'INPUT') {
                            event.preventDefault()
                            window.history.back()
                        }
                        break
                }
            }

            // Handle Cmd/Ctrl shortcuts
            if (isCmd) {
                switch (key) {
                    case 'k':
                        event.preventDefault()
                        setCommandPalette(true)
                        break
                }
            }

            // Handle 'g' prefix shortcuts (Gmail style)
            if (key === 'g' && !isCmd && !isShift) {
                const handleSecondKey = (secondEvent: KeyboardEvent) => {
                    const secondKey = secondEvent.key.toLowerCase()
                    secondEvent.preventDefault()

                    switch (secondKey) {
                        case 'h':
                            router.push('/')
                            break
                        case 'd':
                            if (user) router.push('/dashboard')
                            break
                        case 's':
                            if (user) router.push('/dashboard/social-links')
                            break
                        case 'c':
                            router.push('/contact')
                            break
                        case 'a':
                            router.push('/about')
                            break
                    }

                    document.removeEventListener('keydown', handleSecondKey)
                }

                document.addEventListener('keydown', handleSecondKey)

                // Remove listener after 2 seconds if no second key is pressed
                setTimeout(() => {
                    document.removeEventListener('keydown', handleSecondKey)
                }, 2000)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [router, user])

    const groupedShortcuts = availableShortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = []
        }
        acc[shortcut.category].push(shortcut)
        return acc
    }, {} as Record<string, Shortcut[]>)

    return (
        <>
            {/* Help Dialog */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowHelp(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-glass/90 backdrop-blur-xl rounded-xl border border-white/10 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-cyber-pink/10 text-cyber-pink">
                                        <Keyboard className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
                                </div>
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="p-2 rounded-lg hover:bg-glass/50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                                    <div key={category}>
                                        <h3 className="text-sm font-medium text-foreground/70 uppercase tracking-wider mb-3">
                                            {category}
                                        </h3>
                                        <div className="space-y-2">
                                            {shortcuts.map((shortcut) => (
                                                <div
                                                    key={shortcut.key}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-glass/20 border border-white/5"
                                                >
                                                    <span className="text-foreground/80">{shortcut.description}</span>
                                                    <kbd className="px-2 py-1 text-xs font-mono bg-glass/30 rounded border border-white/10">
                                                        {shortcut.key}
                                                    </kbd>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10 text-center">
                                <p className="text-sm text-foreground/60">
                                    Press <kbd className="px-1 py-0.5 text-xs bg-glass/30 rounded">?</kbd> to show this help again
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Command Palette */}
            <AnimatePresence>
                {commandPalette && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm"
                        onClick={() => setCommandPalette(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="bg-glass/90 backdrop-blur-xl rounded-xl border border-white/10 w-full max-w-lg mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <Search className="w-4 h-4 text-foreground/60" />
                                    <input
                                        type="text"
                                        placeholder="Type a command or search..."
                                        className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-foreground/60"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="p-2 max-h-80 overflow-y-auto">
                                <div className="space-y-1">
                                    {availableShortcuts
                                        .filter(s => s.category === 'navigation')
                                        .map((shortcut) => (
                                            <button
                                                key={shortcut.key}
                                                onClick={() => {
                                                    shortcut.action()
                                                    setCommandPalette(false)
                                                }}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-glass/30 transition-colors text-left"
                                            >
                                                <div className="p-1.5 rounded bg-glass/20">
                                                    {shortcut.description.includes('Homepage') && <Home className="w-3 h-3" />}
                                                    {shortcut.description.includes('Dashboard') && <User className="w-3 h-3" />}
                                                    {shortcut.description.includes('Settings') && <Settings className="w-3 h-3" />}
                                                    {!shortcut.description.includes('Homepage') &&
                                                        !shortcut.description.includes('Dashboard') &&
                                                        !shortcut.description.includes('Settings') && <Command className="w-3 h-3" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">{shortcut.description}</div>
                                                    <div className="text-xs text-foreground/60">{shortcut.key}</div>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

// Hook for using keyboard shortcuts in components
export function useKeyboardShortcut(
    key: string,
    callback: () => void,
    deps: React.DependencyList = []
) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement
            ) {
                return
            }

            if (event.key.toLowerCase() === key.toLowerCase()) {
                event.preventDefault()
                callback()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, deps)
} 