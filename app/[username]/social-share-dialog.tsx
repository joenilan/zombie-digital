"use client"

import { useState } from 'react'
import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CopyButton, ViewButton, QRButton, EditButton, DeleteButton, SuccessButton } from '@/components/ui/action-button'


interface SocialShareDialogProps {
    username: string
    displayName: string
}

export function SocialShareDialog({ username, displayName }: SocialShareDialogProps) {
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/`
        + username

    const shareText = `Check out ${displayName}'s social links!`

    // URLs for different social platforms
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`

    // Copy URL to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <ViewButton size="icon" tooltip="Share Profile" className="rounded-full h-8 w-8">
                    <Share2 size={16} />
                </ViewButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">Share this profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex justify-center gap-4">
                        {/* Twitter Share */}
                        <a
                            href={twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2"
                        >
                            <Button variant="cyber-cyan" size="icon" className="h-12 w-12 rounded-full">
                                <Twitter className="text-white" />
                            </Button>
                            <span className="text-xs">Twitter</span>
                        </a>

                        {/* Facebook Share */}
                        <a
                            href={facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2"
                        >
                            <Button variant="cyber-pink" size="icon" className="h-12 w-12 rounded-full">
                                <Facebook className="text-white" />
                            </Button>
                            <span className="text-xs">Facebook</span>
                        </a>

                        {/* LinkedIn Share */}
                        <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2"
                        >
                            <Button variant="cyber-purple" size="icon" className="h-12 w-12 rounded-full">
                                <Linkedin className="text-white" />
                            </Button>
                            <span className="text-xs">LinkedIn</span>
                        </a>
                    </div>

                    {/* Copy Link */}
                    <div className="relative flex items-center mt-4">
                        <input
                            type="text"
                            value={profileUrl}
                            readOnly
                            className="w-full pr-20 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <CopyButton
                            onClick={copyToClipboard}
                            size="sm"
                            tooltip={copied ? 'Copied!' : 'Copy link'}
                            className="absolute right-0 h-9"
                        >
                            {copied ? <CheckCircle size={16} className="text-green-500" /> : <LinkIcon size={16} />}
                        </CopyButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 