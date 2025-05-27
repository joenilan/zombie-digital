"use client"

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { QrCode, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface QRDialogProps {
    username: string
}

export function QRDialog({ username }: QRDialogProps) {
    const [open, setOpen] = useState(false)
    const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/`
        + username

    // Function to download QR code as SVG
    const downloadQRCode = () => {
        // Get the SVG element
        const svgElement = document.getElementById('profile-qr-code')
        if (!svgElement) return

        // Create a canvas to convert SVG to image
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Create an image element to draw the SVG
        const img = new Image()
        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(svgBlob)

        img.onload = () => {
            // Set canvas dimensions
            canvas.width = img.width
            canvas.height = img.height

            // Draw image on canvas
            ctx?.drawImage(img, 0, 0)

            // Convert canvas to data URL and download
            const imgUrl = canvas.toDataURL('image/png')
            const a = document.createElement('a')
            a.href = imgUrl
            a.download = `${username}-qrcode.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(svgUrl)
        }

        img.src = svgUrl
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    title="Show QR Code"
                >
                    <QrCode className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm border-0 shadow-xl bg-background">
                <DialogHeader>
                    <DialogTitle>Profile QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                    <div className="bg-white p-4 rounded-lg">
                        <QRCode
                            id="profile-qr-code"
                            value={profileUrl}
                            size={200}
                            level="H"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                        Scan this QR code to visit {username}'s profile
                    </p>
                    <Button
                        onClick={downloadQRCode}
                        className="mt-4 gap-2 bg-primary hover:bg-primary/90 text-white border-0"
                    >
                        <Download className="w-4 h-4" />
                        Download QR Code
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 