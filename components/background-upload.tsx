"use client"

import { useState, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Upload, Loader2, X, ImageIcon } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'

interface BackgroundUploadProps {
    userId: string
    onSuccess?: (url: string | null, type: string | null) => void
    showPreview?: boolean
}

interface CurrentBackground {
    url: string | null
    type: string | null
}

export function BackgroundUpload({ userId, onSuccess, showPreview }: BackgroundUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [currentBackground, setCurrentBackground] = useState<CurrentBackground>({ url: null, type: null })
    const [isLoadingCurrent, setIsLoadingCurrent] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClientComponentClient()

    // Load current background on mount
    useEffect(() => {
        async function loadCurrentBackground() {
            try {
                const { data, error } = await supabase
                    .from('twitch_users')
                    .select('background_media_url, background_media_type')
                    .eq('id', userId)
                    .single()

                if (error) {
                    console.error('Error loading current background:', error)
                    return
                }

                setCurrentBackground({
                    url: data.background_media_url,
                    type: data.background_media_type
                })
            } catch (error) {
                console.error('Error loading current background:', error)
            } finally {
                setIsLoadingCurrent(false)
            }
        }

        loadCurrentBackground()
    }, [userId, supabase])

    // Extract filename from URL for cleanup
    const extractFilenameFromUrl = (url: string): string | null => {
        try {
            const urlParts = url.split('/')
            return urlParts[urlParts.length - 1]
        } catch {
            return null
        }
    }

    // Delete old background file from storage
    const deleteOldBackground = async (url: string): Promise<boolean> => {
        try {
            const filename = extractFilenameFromUrl(url)
            if (!filename) return false

            const { error } = await supabase.storage
                .from('backgrounds')
                .remove([filename])

            if (error) {
                console.error('Error deleting old background:', error)
                return false
            }

            console.log('Successfully deleted old background:', filename)
            return true
        } catch (error) {
            console.error('Error deleting old background:', error)
            return false
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type', {
                description: 'Please upload a JPEG, PNG, GIF, or WebP image'
            })
            return
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error('File too large', {
                description: 'Please upload an image smaller than 10MB'
            })
            return
        }

        setIsUploading(true)

        try {
            // Delete old background if it exists
            if (currentBackground.url) {
                console.log('Deleting old background before upload...')
                await deleteOldBackground(currentBackground.url)
            }

            // Generate unique filename
            const timestamp = Date.now()
            const fileExtension = file.name.split('.').pop()
            const filename = `${userId}-${timestamp}.${fileExtension}`

            console.log('Uploading new background:', filename)

            // Upload to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('backgrounds')
                .upload(filename, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                toast.error('Upload failed', {
                    description: uploadError.message
                })
                return
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('backgrounds')
                .getPublicUrl(filename)

            console.log('Generated public URL:', publicUrl)

            // Update database
            const { error: updateError } = await supabase
                .from('twitch_users')
                .update({
                    background_media_url: publicUrl,
                    background_media_type: file.type
                })
                .eq('id', userId)

            if (updateError) {
                console.error('Database update error:', updateError)
                toast.error('Failed to save background', {
                    description: updateError.message
                })
                return
            }

            // Update local state
            setCurrentBackground({
                url: publicUrl,
                type: file.type
            })

            // Call success callback
            onSuccess?.(publicUrl, file.type)

            toast.success('Background updated', {
                description: 'Your profile background has been updated successfully'
            })

        } catch (error) {
            console.error('Unexpected error:', error)
            toast.error('Upload failed', {
                description: 'An unexpected error occurred'
            })
        } finally {
            setIsUploading(false)
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveBackground = async () => {
        if (!currentBackground.url) return

        setIsUploading(true)

        try {
            // Delete from storage
            await deleteOldBackground(currentBackground.url)

            // Update database
            const { error } = await supabase
                .from('twitch_users')
                .update({
                    background_media_url: null,
                    background_media_type: null
                })
                .eq('id', userId)

            if (error) {
                console.error('Error removing background:', error)
                toast.error('Failed to remove background', {
                    description: error.message
                })
                return
            }

            // Update local state
            setCurrentBackground({ url: null, type: null })

            // Call success callback
            onSuccess?.(null, null)

            toast.success('Background removed', {
                description: 'Your profile background has been removed'
            })

        } catch (error) {
            console.error('Error removing background:', error)
            toast.error('Failed to remove background', {
                description: 'An unexpected error occurred'
            })
        } finally {
            setIsUploading(false)
        }
    }

    if (isLoadingCurrent) {
        return (
            <div className="space-y-4">
                <div className="h-48 bg-muted/20 rounded-lg animate-pulse" />
                <div className="h-10 bg-muted/20 rounded-lg animate-pulse w-32" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Current Background Preview */}
            {showPreview && currentBackground.url && (
                <div className="flex justify-center">
                    <div className="relative group max-w-sm w-full">
                        <div className="relative h-48 w-full rounded-xl overflow-hidden">
                            <Image
                                src={currentBackground.url}
                                alt="Current background"
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 400px"
                            />
                            <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0 bg-red-500/90 hover:bg-red-500 backdrop-blur-sm"
                                onClick={handleRemoveBackground}
                                disabled={isUploading}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state or upload area */}
            {!currentBackground.url && showPreview && (
                <div className="h-48 w-full rounded-xl border-2 border-dashed border-cyber-pink/30 flex items-center justify-center transition-colors hover:border-cyber-pink/50 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}>
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-cyber-pink/20 flex items-center justify-center mx-auto">
                            <ImageIcon className="w-8 h-8 text-cyber-pink" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground/80">No background set</p>
                            <p className="text-xs text-muted-foreground">Click here or use the button below to upload</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Controls */}
            <div className="space-y-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={isUploading}
                />

                <div className="text-center space-y-4">
                    <p className="text-xs text-muted-foreground">
                        Drag and drop or click to browse
                    </p>

                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        variant="cyber-pink"
                        size="lg"
                        icon={isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        loading={isUploading}
                    >
                        {isUploading ? 'Uploading...' : (currentBackground.url ? 'Replace Background' : 'Choose File')}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                        Supports JPEG, PNG, GIF, and WebP • Maximum file size: 10MB
                    </p>
                </div>
            </div>
        </div>
    )
} 