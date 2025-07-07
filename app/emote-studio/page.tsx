'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Upload, Settings, Download, Eye, AlertTriangle, Shield, Clock, FileImage, Trash2 } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { processBatchEmotes, ProcessedEmoteData, ProcessingOptions, TWITCH_EMOTE_SIZES } from '@/lib/emote-processor'
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

interface EmoteSettings {
    outputFormat: 'png' | 'gif' | 'webp'
    generateVariations: boolean
    variationCount: number
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

export default function EmoteStudioPage() {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [processedEmotes, setProcessedEmotes] = useState<ProcessedEmoteData[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [settings, setSettings] = useState<EmoteSettings>({
        outputFormat: 'png',
        generateVariations: false,
        variationCount: 12
    })

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
            const options: ProcessingOptions & {
                generateVariations?: boolean
                variationCount?: number
            } = {
                outputFormat: settings.outputFormat,
                generateVariations: settings.generateVariations,
                variationCount: settings.variationCount
            }

            const results = await processBatchEmotes(uploadedFiles, options)
            setProcessedEmotes(results)
            toast.success(`Successfully processed ${results.length} emote(s)!`)
        } catch (error) {
            console.error('Processing failed:', error)
            toast.error('Failed to process emotes')
        } finally {
            setIsProcessing(false)
        }
    }, [uploadedFiles, settings])

    const handleDownloadEmoteAsZip = useCallback(async (emote: ProcessedEmoteData) => {
        try {
            await downloadEmoteAsZip(emote, settings.outputFormat)
            toast.success('Download started!')
        } catch (error) {
            console.error('Download failed:', error)
            toast.error('Failed to create download')
        }
    }, [settings.outputFormat])

    const handleDownloadAll = useCallback(async () => {
        try {
            await downloadEmotesAsZip(processedEmotes, settings.outputFormat)
            toast.success('Download started!')
        } catch (error) {
            console.error('Download failed:', error)
            toast.error('Failed to create download')
        }
    }, [processedEmotes, settings.outputFormat])

    const clearAll = useCallback(() => {
        setProcessedEmotes([])
        setUploadedFiles([])
        toast.success('Cleared all results')
    }, [])

    const downloadSummary = processedEmotes.length > 0 ? getDownloadSummary(processedEmotes) : null

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-white mb-2">Twitch Emote Studio</h1>
                    <p className="text-gray-300">Transform your images into perfect Twitch emotes with automatic sizing and color variations</p>
                </motion.div>

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
                                            <p className="text-gray-300">Files are automatically deleted after 24 hours. No data is stored permanently.</p>
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

                {/* Beta Notice for Animated Emotes */}
                <div className="mb-6">
                    <div className="bg-cyber-pink/10 border border-cyber-pink/40 text-cyber-pink rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span>
                            <strong>Animated emotes (GIF/WebP):</strong> Only the first frame will be exported for now. Full animation support is coming soon!
                        </span>
                    </div>
                </div>

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
                                </div>
                            </div>

                            {/* Uploaded Files */}
                            {uploadedFiles.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-300 mb-2">Uploaded Files</h3>
                                    <div className="flex flex-col gap-2 w-full">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-4 w-full">
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
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Settings */}
                        <Card className="bg-glass/50 backdrop-blur-xl border-white/5 p-6">
                            <h2 className="text-xl font-semibold mb-4">Settings</h2>

                            <div className="space-y-4">
                                {/* Output Format */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Output Format</label>
                                    <select
                                        value={settings.outputFormat}
                                        onChange={(e) => setSettings(prev => ({ ...prev, outputFormat: e.target.value as any }))}
                                        className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                                    >
                                        <option value="png">PNG (Recommended)</option>
                                        <option value="webp">WebP (Smaller files)</option>
                                        <option value="gif">GIF (For animated)</option>
                                    </select>
                                </div>

                                {/* Color Variations */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-300">Color Variations</label>
                                        <input
                                            type="checkbox"
                                            checked={settings.generateVariations}
                                            onChange={(e) => setSettings(prev => ({ ...prev, generateVariations: e.target.checked }))}
                                            className="rounded"
                                        />
                                    </div>

                                    {settings.generateVariations && (
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Number of variations</label>
                                            <input
                                                type="range"
                                                min="2"
                                                max="50"
                                                value={settings.variationCount}
                                                onChange={(e) => setSettings(prev => ({ ...prev, variationCount: parseInt(e.target.value) }))}
                                                className="w-full"
                                            />
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-400">2</span>
                                                <span className="text-lg font-medium text-white">{settings.variationCount}</span>
                                                <span className="text-gray-400">50</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Process Button */}
                            <ActionButtonWithProvider
                                color="cyber-pink"
                                size="default"
                                tooltip={isProcessing ? "Processing your emotes..." : "Start processing uploaded images"}
                                onClick={processEmotes}
                                disabled={uploadedFiles.length === 0 || isProcessing}
                                className="w-full mt-6"
                                loading={isProcessing}
                                icon={<Settings className="w-4 h-4" />}
                            >
                                {isProcessing ? 'Processing...' : 'Process Emotes'}
                            </ActionButtonWithProvider>
                        </Card>
                    </motion.div>

                    {/* Results Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <Card className="bg-glass/50 backdrop-blur-xl border-white/5 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Results</h2>
                                {downloadSummary && (
                                    <div className="text-sm text-gray-300">
                                        {downloadSummary.totalFiles} files • {downloadSummary.estimatedSize}
                                    </div>
                                )}
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
                                                        {Object.entries(emote.sizes).map(([size, dataURL]) => {
                                                            const actualSize = parseInt(size.split('x')[0])
                                                            const containerPercent = actualSize === 28 ? 0.4 : actualSize === 56 ? 0.7 : 1
                                                            return (
                                                                <div
                                                                    key={size}
                                                                    className="text-center cursor-pointer hover:bg-white/10 rounded-lg transition-colors"
                                                                    onClick={() => {
                                                                        const filename = generateEmoteFilename(emote.originalFile.name, size, undefined, settings.outputFormat)
                                                                        downloadEmoteSize(dataURL, filename)
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
                                                                            onClick={() => downloadEmoteVariation(emote, variationIndex, settings.outputFormat)}
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
                                                                                    onClick={() => downloadEmoteVariation(emote, variationIndex, settings.outputFormat)}
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
    )
} 