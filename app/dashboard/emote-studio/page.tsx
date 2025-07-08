'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Upload,
    Download,
    Settings,
    ImageIcon,
    Layers,
    Eye,
    Copy
} from '@/lib/icons'
import { toast } from 'sonner'
import { CopyButton, DeleteButton, ViewButton, ActionButtonWithProvider } from '@/components/ui/action-button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
    processBatchEmotes,
    validateEmoteFile,
    type ProcessedEmoteData,
    type ProcessingOptions,
    TWITCH_EMOTE_SIZES
} from '@/lib/emote-processor'
import {
    downloadEmoteSizes,
    downloadEmoteAsZip,
    downloadEmoteVariation,
    downloadEmotesAsZip,
    copyEmoteToClipboard,
    getDownloadSummary
} from '@/lib/emote-downloads'
import { logError } from '@/lib/debug'

interface EmoteSettings extends ProcessingOptions {
    generateVariations: boolean
    variationCount: number
}

export default function EmoteStudioPage() {
    const { user } = useAuthStore()
    const [isDragging, setIsDragging] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [processedEmotes, setProcessedEmotes] = useState<ProcessedEmoteData[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [settings, setSettings] = useState<EmoteSettings>({
        hueShift: 0,
        saturation: 100,
        brightness: 100,
        contrast: 100,
        generateVariations: false,
        variationCount: 5,
        outputFormat: 'png',
        quality: 95
    })

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        )

        if (files.length === 0) {
            toast.error('Please upload valid image files (PNG, JPG, GIF, WebP)')
            return
        }

        handleFiles(files)
    }, [])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        handleFiles(files)
    }, [])

    const handleFiles = useCallback((files: File[]) => {
        // Validate files
        const validFiles = files.filter(file => {
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
    }, [])

    const processEmotes = useCallback(async () => {
        if (uploadedFiles.length === 0) {
            toast.error('Please upload at least one image')
            return
        }

        setIsProcessing(true)

        try {
            const processingOptions = {
                hueShift: settings.hueShift,
                saturation: settings.saturation,
                brightness: settings.brightness,
                contrast: settings.contrast,
                outputFormat: settings.outputFormat,
                quality: settings.quality,
                generateVariations: settings.generateVariations,
                variationCount: settings.variationCount,
                sizes: TWITCH_EMOTE_SIZES
            }

            const results = await processBatchEmotes(uploadedFiles, processingOptions)
            setProcessedEmotes(results)
            setUploadedFiles([]) // Clear upload queue
            toast.success(`Successfully processed ${results.length} emote(s)`)

        } catch (error) {
            logError('Error processing emotes:', error)
            toast.error('Failed to process emotes')
        } finally {
            setIsProcessing(false)
        }
    }, [uploadedFiles, settings])

    const handleDownloadAll = useCallback(async () => {
        if (processedEmotes.length === 0) return

        try {
            await downloadEmotesAsZip(processedEmotes, settings.outputFormat)
            toast.success('Download started!')
        } catch (error) {
            logError('Download failed:', error)
            toast.error('Failed to create download')
        }
    }, [processedEmotes, settings.outputFormat])

    const handleCopyEmote = useCallback(async (dataURL: string) => {
        try {
            await copyEmoteToClipboard(dataURL)
            toast.success('Copied to clipboard!')
        } catch (error) {
            logError('Copy failed:', error)
            toast.error('Failed to copy to clipboard')
        }
    }, [])

    const handleDownloadEmoteAsZip = useCallback(async (emote: ProcessedEmoteData) => {
        try {
            await downloadEmoteAsZip(emote, settings.outputFormat)
            toast.success('Download started!')
        } catch (error) {
            logError('Download failed:', error)
            toast.error('Failed to create download')
        }
    }, [settings.outputFormat])

    const clearAll = useCallback(() => {
        setProcessedEmotes([])
        setUploadedFiles([])
        toast.success('Cleared all results')
    }, [])

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-cyber-pink/20 rounded-xl">
                        <ImageIcon className="w-8 h-8 text-cyber-pink" />
                    </div>
                    <h1 className="text-4xl font-bold gradient-text">
                        Twitch Emote Studio
                    </h1>
                </div>
                <p className="text-foreground/70 max-w-2xl mx-auto">
                    Create professional Twitch emotes and sub badges with automatic sizing,
                    color variations, and batch processing - all in your browser.
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Upload & Settings Panel */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Upload Zone */}
                    <Card className="bg-glass/50 backdrop-blur-xl border-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="w-5 h-5" />
                                Upload Images
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileInput}
                                className="hidden"
                            />

                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                                    transition-all duration-300 hover:border-cyber-pink/50
                                    ${isDragging ? 'border-cyber-pink bg-cyber-pink/10' : 'border-white/20'}
                                `}
                            >
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-cyber-pink/20 rounded-full flex items-center justify-center mx-auto">
                                        <ImageIcon className="w-8 h-8 text-cyber-pink" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Drop images here or click to browse
                                        </p>
                                        <p className="text-sm text-foreground/60 mt-2">
                                            Supports PNG, JPG, GIF, WebP • Max 10MB per file
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Upload Queue */}
                            {uploadedFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <Label className="text-sm font-medium">Queued Files ({uploadedFiles.length})</Label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm bg-white/5 rounded-lg p-2">
                                                <ImageIcon className="w-4 h-4 text-cyber-cyan" />
                                                <span className="flex-1 truncate">{file.name}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {(file.size / 1024 / 1024).toFixed(1)}MB
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Processing Settings */}
                    <Card className="bg-glass/50 backdrop-blur-xl border-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Processing Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Output Format</Label>
                                    <Select value={settings.outputFormat} onValueChange={(value: 'png' | 'gif' | 'webp') =>
                                        setSettings(prev => ({ ...prev, outputFormat: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="png">PNG (Static)</SelectItem>
                                            <SelectItem value="gif">GIF (Animated)</SelectItem>
                                            <SelectItem value="webp">WebP (Modern)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label>Generate Color Variations</Label>
                                    <Switch
                                        checked={settings.generateVariations}
                                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, generateVariations: checked }))}
                                    />
                                </div>

                                {settings.generateVariations && (
                                    <div className="space-y-2">
                                        <Label>Variation Count: {settings.variationCount}</Label>
                                        <input
                                            type="range"
                                            min="2"
                                            max="12"
                                            value={settings.variationCount}
                                            onChange={(e) => setSettings(prev => ({ ...prev, variationCount: parseInt(e.target.value) }))}
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>

                            <ActionButtonWithProvider
                                color="cyber-pink"
                                size="default"
                                tooltip={isProcessing ? "Processing your emotes..." : "Start processing uploaded images"}
                                onClick={processEmotes}
                                disabled={uploadedFiles.length === 0 || isProcessing}
                                className="w-full"
                                loading={isProcessing}
                                icon={!isProcessing ? <Settings className="w-4 h-4" /> : undefined}
                            >
                                {isProcessing ? "Processing..." : "Process Emotes"}
                            </ActionButtonWithProvider>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2">
                    <Card className="bg-glass/50 backdrop-blur-xl border-white/5 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                Preview & Download
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {processedEmotes.length === 0 ? (
                                <div className="text-center py-16 space-y-4">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                        <Layers className="w-12 h-12 text-white/40" />
                                    </div>
                                    <div>
                                        <p className="text-foreground/60">No emotes processed yet</p>
                                        <p className="text-sm text-foreground/40 mt-1">
                                            Upload images and click "Process Emotes" to get started
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Emote List */}
                                    <div className="grid gap-4">
                                        {processedEmotes.map((emote) => (
                                            <motion.div
                                                key={emote.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="border border-white/10 rounded-xl p-4 space-y-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-medium text-foreground">
                                                        {emote.originalFile.name}
                                                    </h3>
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

                                                {/* Size Previews */}
                                                <div className="flex gap-4 items-end">
                                                    {Object.entries(emote.sizes).map(([size, dataUrl]) => (
                                                        <div key={size} className="text-center space-y-2">
                                                            <div
                                                                className="bg-black/20 rounded-lg p-2 inline-block cursor-pointer hover:bg-black/30 transition-colors"
                                                                onClick={() => handleCopyEmote(dataUrl)}
                                                                title="Click to copy"
                                                            >
                                                                <img
                                                                    src={dataUrl}
                                                                    alt={`${size}x${size}`}
                                                                    style={{ width: `${size}px`, height: `${size}px` }}
                                                                    className="rounded"
                                                                />
                                                            </div>
                                                            <div className="text-xs text-foreground/60">
                                                                {size}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Variations */}
                                                {emote.variations && emote.variations.length > 0 && (
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-medium text-cyber-pink">
                                                            Color Variations ({emote.variations.length})
                                                        </Label>
                                                        <div className="grid gap-3">
                                                            {emote.variations.map((variation, index) => (
                                                                <div key={variation.id} className="bg-white/5 rounded-lg p-3">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-sm text-foreground/80">
                                                                            {variation.name} (Hue: {variation.hueShift}°)
                                                                        </span>
                                                                        <CopyButton size="sm" tooltip="Download variation" onClick={() => downloadEmoteVariation(emote, index, settings.outputFormat)}>
                                                                            <Download className="w-3 h-3" />
                                                                        </CopyButton>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        {Object.entries(variation.sizes).map(([size, dataUrl]) => (
                                                                            <div
                                                                                key={size}
                                                                                className="bg-black/20 rounded p-1 cursor-pointer hover:bg-black/30 transition-colors"
                                                                                onClick={() => handleCopyEmote(dataUrl)}
                                                                                title="Click to copy"
                                                                            >
                                                                                <img
                                                                                    src={dataUrl}
                                                                                    alt={`${size}x${size} variation`}
                                                                                    style={{ width: `${Math.floor(parseInt(size) * 0.7)}px`, height: `${Math.floor(parseInt(size) * 0.7)}px` }}
                                                                                    className="rounded"
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>

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
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 