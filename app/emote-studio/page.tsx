'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Upload, Settings, Download, Eye, AlertTriangle, Shield, Clock, FileImage, Trash2 } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { processBatchEmotes, ProcessedEmoteData as OriginalProcessedEmoteData, ProcessingOptions, TWITCH_EMOTE_SIZES } from '@/lib/emote-processor'
import { CopyButton, DeleteButton, ViewButton, ActionButtonWithProvider } from '@/components/ui/action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
    downloadEmoteAsZip,
    downloadEmoteVariation,
    downloadEmotesAsZip,
    copyEmoteToClipboard,
    getDownloadSummary,
    generateEmoteFilename,
    downloadEmoteSize
} from '@/lib/emote-downloads'
import { useDropzone } from 'react-dropzone'
import type { FileWithPath } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'

// Extend ProcessedEmoteData to include uploadedAt
interface ProcessedEmoteData extends OriginalProcessedEmoteData {
    uploadedAt?: number
}

interface EmoteSettings {
    generateVariations: boolean
    variationCount: number
    shine: boolean
}

// File validation helper
function validateEmoteFile(file: File): { valid: boolean; error?: string } {
    const isValidType = file.type.startsWith('image/')
    const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit

    if (!isValidType) {
        return { valid: false, error: `${file.name} is not a valid image file` }
    }

    if (!isValidSize) {
        return { valid: false, error: `${file.name} is too large (max 10MB)` }
    }

    return { valid: true }
}

// Utility to detect animated files
type AnimatedMime = 'image/gif' | 'image/apng' | 'video/mp4' | 'video/webm' | 'image/webp'
function isAnimatedFile(file: File): boolean {
    const animatedTypes: AnimatedMime[] = [
        'image/gif',
        'image/apng',
        'video/mp4',
        'video/webm',
        'image/webp', // treat all as animated for MVP
    ]
    return animatedTypes.includes(file.type as AnimatedMime)
}

// Helper to upload a file to Supabase Storage and return the public URL
async function uploadToSupabaseStorage(file: File): Promise<string> {
    // Use a unique filename to avoid collisions
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split('.').pop() || 'bin'
    const filename = `emote-${timestamp}-${random}.${ext}`

    // Upload to 'emote-uploads' bucket
    const { error: uploadError } = await supabase.storage
        .from('emote-uploads')
        .upload(filename, file, {
            cacheControl: '3600',
            upsert: false,
        })
    if (uploadError) throw new Error('Failed to upload to Supabase Storage: ' + uploadError.message)

    // Get public URL
    const { data } = supabase.storage.from('emote-uploads').getPublicUrl(filename)
    if (!data?.publicUrl) throw new Error('Failed to get public URL from Supabase Storage')
    return data.publicUrl
}

// Unified download function for any image URL (data URL or remote)
async function downloadImageFromUrl(url: string, filename: string) {
    const response = await fetch(url, { mode: 'cors' })
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
}

// Countdown timer for emote expiry
function ExpiryCountdown({ uploadedAt, expiryMinutes = 30 }: { uploadedAt: number, expiryMinutes?: number }) {
    const [remaining, setRemaining] = useState(expiryMinutes * 60)

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now()
            const expiry = uploadedAt + expiryMinutes * 60 * 1000
            const secondsLeft = Math.max(0, Math.floor((expiry - now) / 1000))
            setRemaining(secondsLeft)
        }, 1000)
        return () => clearInterval(interval)
    }, [uploadedAt, expiryMinutes])

    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60

    return (
        <span className="text-xs text-cyber-pink">
            {remaining > 0
                ? `This file will be deleted in ${mins}:${secs.toString().padStart(2, '0')}`
                : 'File deleted. Please re-upload if needed.'}
        </span>
    )
}

export default function EmoteStudioPage() {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [processedEmotes, setProcessedEmotes] = useState<ProcessedEmoteData[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [settings, setSettings] = useState<EmoteSettings>({
        generateVariations: false,
        shine: false,
        variationCount: 12
    })
    const [userRole, setUserRole] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles: FileWithPath[]) => {
            const validFiles = acceptedFiles.filter((file: File) => {
                const validation = validateEmoteFile(file)
                if (!validation.valid) {
                    toast.error(validation.error)
                    return false
                }
                return true
            })

            if (validFiles.length > 0) {
                setUploadedFiles(prev => [...prev, ...validFiles])
                toast.success(`Added ${validFiles.length} file(s) to processing queue`)
            }
        },
        onDragOver: () => {
            setIsDragging(true)
        },
        onDragLeave: () => {
            setIsDragging(false)
        }
    })

    const removeFile = useCallback((index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index))
        toast.success('File removed')
    }, [])

    const processEmotes = useCallback(async () => {
        if (uploadedFiles.length === 0) return

        setIsProcessing(true)
        try {
            const animatedFiles = uploadedFiles.filter(isAnimatedFile)
            const staticFiles = uploadedFiles.filter(f => !isAnimatedFile(f))

            const processed: ProcessedEmoteData[] = []

            // 1. Process static files in-browser (as before)
            if (staticFiles.length > 0) {
                const options: ProcessingOptions & {
                    generateVariations?: boolean
                    variationCount?: number
                    shine?: boolean
                } = {
                    generateVariations: settings.generateVariations,
                    variationCount: settings.variationCount,
                    shine: settings.shine
                }
                const staticResults = await processBatchEmotes(staticFiles, options)
                // Add uploadedAt to each static emote
                processed.push(...staticResults.map(emote => ({ ...emote, uploadedAt: Date.now() })))
            }

            // 2. Process animated files via API
            for (const file of animatedFiles) {
                // Upload to Supabase Storage (implement or reuse your upload logic)
                const supabaseUrl = await uploadToSupabaseStorage(file) // You must implement this

                // Only allow gif or webp as output for animated
                const animatedOutputFormat = 'gif' // Always use GIF for animated

                const res = await fetch('/api/emote-animated', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileUrl: supabaseUrl,
                        outputFormat: animatedOutputFormat,
                    }),
                })
                const { urls } = await res.json()

                processed.push({
                    id: crypto.randomUUID(),
                    originalFile: file,
                    sizes: {
                        '112x112': urls[0],
                        '56x56': urls[1],
                        '28x28': urls[2],
                    },
                    uploadedAt: Date.now(), // Add uploadedAt for animated emotes
                })
            }

            setProcessedEmotes(processed)
            toast.success(`Successfully processed ${processed.length} emote(s)!`)
        } catch (error) {
            console.error('Processing failed:', error)
            toast.error('Failed to process emotes')
        } finally {
            setIsProcessing(false)
        }
    }, [uploadedFiles, settings])

    const handleDownloadEmoteAsZip = useCallback(async (emote: ProcessedEmoteData) => {
        try {
            await downloadEmoteAsZip(emote, 'png') // Always use PNG for ZIP download
            toast.success('Download started!')
        } catch (error) {
            console.error('Download failed:', error)
            toast.error('Failed to create download')
        }
    }, [])

    const handleDownloadAll = useCallback(async () => {
        try {
            await downloadEmotesAsZip(processedEmotes, 'png') // Always use PNG for ZIP download
            toast.success('Download started!')
        } catch (error) {
            console.error('Download failed:', error)
            toast.error('Failed to create download')
        }
    }, [processedEmotes])

    const clearAll = useCallback(() => {
        setProcessedEmotes([])
        setUploadedFiles([])
        toast.success('Cleared all results')
    }, [])

    const downloadSummary = processedEmotes.length > 0 ? getDownloadSummary(processedEmotes) : null

    const hasAnimatedFiles = uploadedFiles.some(isAnimatedFile)

    // Fetch user role on mount
    useEffect(() => {
        let isMounted = true
        async function fetchUserRole() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) {
                if (isMounted) setUserRole(null)
                return
            }
            const { data, error } = await supabase
                .from('twitch_users')
                .select('site_role')
                .eq('id', session.user.id)
                .single<{ site_role: string }>()
            if (!error && data && data.site_role) {
                if (isMounted) setUserRole(data.site_role)
            } else {
                if (isMounted) setUserRole(null)
            }
        }
        fetchUserRole()
        return () => { isMounted = false }
    }, [])

    const orderedSizeKeys: string[] = ['28x28', '56x56', '112x112']

    // Fetch Cloudinary usage
    const { data: cloudinaryUsage, isLoading: usageLoading, error: usageError } = useQuery({
        queryKey: ['cloudinary-usage'],
        queryFn: async () => {
            const res = await fetch('/api/emote-animated/usage')
            if (!res.ok) throw new Error('Failed to fetch Cloudinary usage')
            return res.json()
        },
        refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    })

    // Determine if animated uploads should be disabled
    const animatedUploadsDisabled = !!cloudinaryUsage && typeof cloudinaryUsage.credits?.limit === 'number' && typeof cloudinaryUsage.credits?.usage === 'number' && cloudinaryUsage.credits.usage >= cloudinaryUsage.credits.limit;

    // Compact usage bar for header
    const renderCloudinaryUsageBarInline = () => {
        if (usageLoading || !cloudinaryUsage || typeof cloudinaryUsage.credits?.limit !== 'number' || typeof cloudinaryUsage.credits?.usage !== 'number') {
            return null;
        }
        const limit = cloudinaryUsage.credits.limit;
        const usage = cloudinaryUsage.credits.usage;
        const usedPercent = (usage && limit) ? (usage / limit) : 0;
        return (
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-3 bg-glass/70 backdrop-blur-xl border border-cyber-pink/60 shadow-cyber px-5 py-2 rounded-full">
                    <Shield className="w-5 h-5 text-cyber-pink animate-pulse" />
                    <span className="text-xs font-bold text-cyber-pink drop-shadow-cyber">Animated Emote Credits</span>
                    <span className="text-xs text-white/90">{usage} / {limit} used</span>
                    <div className="w-32 h-2 bg-cyber-cyan/20 rounded-full overflow-hidden border border-cyber-cyan/40">
                        <div
                            className="h-2 bg-gradient-to-r from-cyber-cyan to-cyber-pink animate-pulse"
                            style={{ width: `${Math.min(100, usedPercent * 100)}%` }}
                        />
                    </div>
                    {usedPercent > 0.8 && (
                        <span className="text-xs text-cyber-pink font-bold ml-2 animate-pulse">Low credits!</span>
                    )}
                </div>
                <span className="text-[10px] text-cyber-pink mt-1">* Powered by Cloudinary Free Tier. Limits reset monthly.</span>
            </div>
        );
    };

    return (
        <>
            <div className="container mx-auto px-4 pt-8 flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Twitch Emote Studio</h1>
                        <p className="text-gray-300">Transform your images into perfect Twitch emotes with automatic sizing and color variations</p>
                    </div>
                </div>
            </div>
            <div className="min-h-screen">
                <div className="container mx-auto px-4 pb-8">
                    {/* Safety Disclaimer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 p-6">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-amber-100">Upload Guidelines & Safety</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-start gap-2">
                                            <FileImage className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-emerald-200 font-medium">Allowed Content</p>
                                                <p className="text-gray-300">Original artwork, emotes, memes, photos, and other creative content that doesn't harm others</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Shield className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-red-200 font-medium">Prohibited Content</p>
                                                <p className="text-gray-300">Content involving harm, hate speech, harassment, exploitation, or illegal activities</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Clock className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-cyan-200 font-medium">Data Protection</p>
                                                <p className="text-gray-300">Files are automatically deleted after 30 mins. No data is stored permanently.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-xs">
                                        By uploading files, you confirm you have the right to use this content and agree it complies with our guidelines.
                                        Files are processed securely via Supabase Storage with automatic cleanup.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Results Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Upload & Settings Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1 space-y-6"
                        >
                            {/* File Upload */}
                            <Card className="bg-glass/50 backdrop-blur-xl border-white/5 p-6">
                                <h2 className="text-xl font-semibold mb-4">Upload Images</h2>

                                <div
                                    {...getRootProps()}
                                    className={`
                                    border-2 border-dashed rounded-xl p-8 text-center transition-colors
                                    ${isDragActive ? 'border-cyber-pink bg-cyber-pink/5' : 'border-white/10 hover:border-white/20'}
                                    cursor-pointer
                                `}
                                >
                                    <input {...getInputProps()} />
                                    <div className="flex flex-col items-center gap-4">
                                        <Upload className="w-8 h-8 text-white/60" />
                                        <div>
                                            <p className="text-lg font-medium mb-1">Drop your emote files here</p>
                                            <p className="text-sm text-white/60">or click to select files</p>
                                        </div>
                                        <p className="mt-3 text-xs text-gray-400 text-center">
                                            Max file size: 10MB. Supported formats: PNG, JPG, WEBP, GIF, APNG, MP4, WEBM.
                                        </p>
                                    </div>
                                </div>

                                {/* Uploaded Files */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium text-gray-300 mb-2">Uploaded Files</h3>
                                        <div className="flex flex-col gap-2 w-full">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="w-full flex flex-col">
                                                    <div className="flex items-center gap-4 w-full">
                                                        <div className="flex-shrink-0 w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={URL.createObjectURL(file)}
                                                                alt={file.name}
                                                                className="max-w-full max-h-full object-contain"
                                                                style={{ imageRendering: 'pixelated' }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 flex items-center gap-2 min-w-0">
                                                            <span className="truncate text-sm text-white/90">{file.name}</span>
                                                            <DeleteButton
                                                                size="sm"
                                                                tooltip="Remove from queue"
                                                                onClick={() => {
                                                                    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
                                                                    toast.success('File removed from queue')
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </DeleteButton>
                                                        </div>
                                                    </div>
                                                    {isAnimatedFile(file) && (
                                                        <div className="w-full text-xs text-cyber-pink mt-1 text-left">
                                                            * Color variations are only generated for static emotes. Animated emotes will not have color variants.
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* Settings */}
                            <div className="flex items-center gap-4 mt-4">
                                <button
                                    type="button"
                                    className={`px-4 py-2 rounded-full font-semibold transition-colors border border-cyber-pink shadow-cyber focus:outline-none focus:ring-2 focus:ring-cyber-pink/50 ${settings.generateVariations ? 'bg-cyber-pink text-white' : 'bg-glass/30 text-cyber-pink'}`}
                                    onClick={() => setSettings(prev => ({ ...prev, generateVariations: !prev.generateVariations }))}
                                >
                                    Color Variations
                                </button>
                                {userRole === 'admin' || userRole === 'owner' ? (
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-full font-semibold transition-colors border border-cyber-cyan shadow-cyber focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50 ${settings.shine ? 'bg-cyber-cyan text-white' : 'bg-glass/30 text-cyber-cyan'}`}
                                        onClick={() => setSettings(prev => ({ ...prev, shine: !prev.shine }))}
                                    >
                                        Shine
                                    </button>
                                ) : null}
                                <ActionButtonWithProvider
                                    color="cyber-pink"
                                    size="default"
                                    tooltip={isProcessing ? "Processing your emotes..." : "Start processing uploaded images"}
                                    onClick={processEmotes}
                                    disabled={uploadedFiles.length === 0 || isProcessing}
                                    className="ml-auto"
                                    loading={isProcessing}
                                    icon={<Settings className="w-4 h-4" />}
                                >
                                    {isProcessing ? 'Processing...' : 'Process Emotes'}
                                </ActionButtonWithProvider>
                            </div>
                            {settings.generateVariations && (
                                <div className="flex items-center gap-4 mt-2 ml-1">
                                    <label className="block text-xs text-gray-400">Number of variants</label>
                                    <input
                                        type="range"
                                        min="2"
                                        max="50"
                                        value={settings.variationCount}
                                        onChange={e => setSettings(prev => ({ ...prev, variationCount: parseInt(e.target.value) }))}
                                        className="w-32"
                                    />
                                    <span className="text-lg font-medium text-white">{settings.variationCount}</span>
                                </div>
                            )}
                        </motion.div>

                        {/* Results Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-2"
                        >
                            <Card className="bg-glass/50 backdrop-blur-xl border-white/5 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Results</h2>
                                    {renderCloudinaryUsageBarInline()}
                                </div>

                                <AnimatePresence mode="wait">
                                    {processedEmotes.length === 0 ? (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center py-12"
                                        >
                                            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                                            <p className="text-gray-400">Upload and process images to see results here</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="results"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-8"
                                        >
                                            {processedEmotes.map((emote, emoteIndex) => (
                                                <div key={emote.id} className="border border-white/10 rounded-lg p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-medium">{emote.originalFile.name}</h3>
                                                        <div className="flex gap-2">
                                                            <CopyButton
                                                                size="sm"
                                                                tooltip="Download as ZIP (all sizes + variations)"
                                                                onClick={() => handleDownloadEmoteAsZip(emote)}
                                                                icon={<Download className="w-4 h-4" />}
                                                            >
                                                                Download ZIP
                                                            </CopyButton>
                                                        </div>
                                                    </div>

                                                    {/* Main Sizes */}
                                                    <div className="mb-6">
                                                        <h4 className="text-sm font-medium text-gray-300 mb-3">Standard Sizes</h4>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {orderedSizeKeys.map((size: string) => {
                                                                const dataURL = emote.sizes[size]
                                                                if (!dataURL) return null
                                                                const actualSize = parseInt(size.split('x')[0])
                                                                const containerPercent = actualSize === 28 ? 0.4 : actualSize === 56 ? 0.7 : 1
                                                                return (
                                                                    <div
                                                                        key={size}
                                                                        className="text-center cursor-pointer hover:bg-white/10 rounded-lg transition-colors"
                                                                        onClick={() => {
                                                                            const filename = generateEmoteFilename(emote.originalFile.name, size, undefined, 'png') // Always use PNG for download
                                                                            downloadImageFromUrl(dataURL, filename)
                                                                        }}
                                                                        title={`Click to download ${size} version`}
                                                                    >
                                                                        <div className="bg-white/5 rounded-lg p-2 mb-2 flex items-center justify-center aspect-square">
                                                                            <img
                                                                                src={dataURL}
                                                                                alt={`${size} emote`}
                                                                                className="mx-auto object-contain"
                                                                                style={{
                                                                                    imageRendering: 'pixelated',
                                                                                    width: `${containerPercent * 100}%`,
                                                                                    height: `${containerPercent * 100}%`
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="text-xs text-gray-400">{size}</div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Color Variations */}
                                                    {emote.variations && emote.variations.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-300 mb-2">Variations ({emote.variations.length})</h4>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                                                                {emote.variations.map((variation, variationIndex) => (
                                                                    <div key={variation.id} className="bg-glass/50 backdrop-blur-sm border border-white/5 rounded-lg p-2">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <ViewButton
                                                                                size="sm"
                                                                                tooltip="Download all sizes for this variation"
                                                                                onClick={() => downloadEmoteVariation(emote, variationIndex, 'gif')} // Always use GIF for variation download
                                                                                className="w-full"
                                                                            >
                                                                                Download Variation
                                                                            </ViewButton>
                                                                        </div>
                                                                        <div className="grid grid-cols-3 gap-1">
                                                                            {Object.entries(variation.sizes).map(([size, dataURL]) => {
                                                                                const actualSize = parseInt(size.split('x')[0])
                                                                                const containerPercent = actualSize === 28 ? 0.4 : actualSize === 56 ? 0.7 : 1
                                                                                return (
                                                                                    <div
                                                                                        key={size}
                                                                                        className="text-center cursor-pointer hover:bg-white/10 rounded transition-colors"
                                                                                        onClick={() => downloadEmoteVariation(emote, variationIndex, 'gif')} // Always use GIF for variation download
                                                                                        title={`Click to download ${size} version`}
                                                                                    >
                                                                                        <div className="bg-white/5 rounded p-1 flex items-center justify-center aspect-square">
                                                                                            <img
                                                                                                src={dataURL}
                                                                                                alt={`Variation ${size}`}
                                                                                                className="mx-auto object-contain"
                                                                                                style={{
                                                                                                    imageRendering: 'pixelated',
                                                                                                    width: `${containerPercent * 100}%`,
                                                                                                    height: `${containerPercent * 100}%`
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="text-[10px] text-gray-500">{size}</div>
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Only show ExpiryCountdown for animated emotes */}
                                                    {isAnimatedFile(emote.originalFile) && (
                                                        <ExpiryCountdown uploadedAt={emote.uploadedAt ?? Date.now()} expiryMinutes={30} />
                                                    )}
                                                </div>
                                            ))}

                                            {/* Bulk Actions */}
                                            <div className="flex gap-3 pt-4 border-t border-white/10">
                                                <TooltipProvider>
                                                    <CopyButton
                                                        tooltip="Download all as ZIP"
                                                        onClick={handleDownloadAll}
                                                        icon={<Download className="w-4 h-4" />}
                                                    >
                                                        Download All
                                                    </CopyButton>
                                                    <ViewButton
                                                        tooltip="Clear all results"
                                                        onClick={clearAll}
                                                        icon={<Eye className="w-4 h-4" />}
                                                    >
                                                        Clear All
                                                    </ViewButton>
                                                </TooltipProvider>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    )
} 