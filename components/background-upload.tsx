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
            {showPreview && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Current Background</h3>
                    {currentBackground.url ? (
                        <div className="relative group">
                            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted/20">
                                <Image
                                    src={currentBackground.url}
                                    alt="Current background"
                                    fill
                                    className="object-cover"
                                    sizes="400px"
                                />
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                onClick={handleRemoveBackground}
                                disabled={isUploading}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="h-48 w-full rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                            <div className="text-center">
                                <ImageIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No background set</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium">
                    {currentBackground.url ? 'Replace Background' : 'Upload Background'}
                </h3>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={isUploading}
                />

                <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            {currentBackground.url ? 'Replace Background' : 'Upload Background'}
                        </>
                    )}
                </Button>

                <p className="text-xs text-muted-foreground">
                    Supports JPEG, PNG, GIF, and WebP. Maximum file size: 10MB
                </p>
            </div>
        </div>
    )
} 