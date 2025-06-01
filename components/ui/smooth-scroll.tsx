'use client'

import { useEffect } from 'react'

// Smooth scroll utility functions
export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({
        top: 0,
        behavior
    })
}

export const scrollToElement = (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId)
    if (element) {
        const elementPosition = element.offsetTop - offset
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        })
    }
}

// Focus management utilities
export const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
        element.focus()
        // Ensure the element is visible
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
}

export const trapFocus = (containerElement: HTMLElement) => {
    const focusableElements = containerElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus()
                    e.preventDefault()
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus()
                    e.preventDefault()
                }
            }
        }
    }

    containerElement.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
        containerElement.removeEventListener('keydown', handleTabKey)
    }
}

// Back to top button component
export function BackToTopButton() {
    useEffect(() => {
        // Add smooth scroll behavior to html element
        document.documentElement.style.scrollBehavior = 'smooth'

        return () => {
            document.documentElement.style.scrollBehavior = 'auto'
        }
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            const button = document.getElementById('back-to-top')
            if (button) {
                if (window.scrollY > 300) {
                    button.style.opacity = '1'
                    button.style.pointerEvents = 'auto'
                } else {
                    button.style.opacity = '0'
                    button.style.pointerEvents = 'none'
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <button
            id="back-to-top"
            onClick={() => scrollToTop()}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-cyber-gradient text-white shadow-cyber hover:shadow-cyber-hover transition-smooth opacity-0 pointer-events-none focus-ring"
            aria-label="Back to top"
        >
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
            </svg>
        </button>
    )
}

// Skip to content link for accessibility
export function SkipToContent() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-cyber-gradient text-white rounded-md focus-ring"
        >
            Skip to main content
        </a>
    )
}

// Enhanced focus management hook
export function useFocusManagement() {
    useEffect(() => {
        // Enhanced focus visible styles
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation')
            }
        }

        const handleMouseDown = () => {
            document.body.classList.remove('keyboard-navigation')
        }

        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('mousedown', handleMouseDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('mousedown', handleMouseDown)
        }
    }, [])
} 