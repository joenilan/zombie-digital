'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Palette, RotateCcw } from 'lucide-react'

interface CustomColors {
    primary: string
    secondary: string
    accent: string
}

interface CustomColorPickerProps {
    initialColors?: CustomColors
    onColorsChange: (colors: CustomColors) => void
    onPreview?: (colors: CustomColors) => void
}

const defaultColors: CustomColors = {
    primary: '#ec4899', // cyber-pink
    secondary: '#9146ff', // cyber-purple
    accent: '#8df5ff' // light cyan
}

export function CustomColorPicker({
    initialColors = defaultColors,
    onColorsChange,
    onPreview
}: CustomColorPickerProps) {
    const [colors, setColors] = useState<CustomColors>(initialColors)
    const [inputValues, setInputValues] = useState<CustomColors>(initialColors)
    const isDraggingRef = useRef<{ [key: string]: boolean }>({})
    const dragTimeoutRef = useRef<{ [key: string]: number | null }>({})

    // Update colors when props change
    useEffect(() => {
        setColors(initialColors)
        setInputValues(initialColors)
    }, [initialColors])

    const handleColorChange = (colorType: keyof CustomColors, value: string, isFromDrag = false) => {
        // Validate hex color format
        const hexRegex = /^#[0-9A-Fa-f]{6}$/
        if (hexRegex.test(value) || value === '') {
            const newColors = { ...colors, [colorType]: value }
            setColors(newColors)
            setInputValues(newColors) // Keep input values in sync

            if (isFromDrag) {
                // During drag, only preview
                onPreview?.(newColors)
            } else {
                // On manual input or confirmed selection, save the changes
                onColorsChange(newColors)
                onPreview?.(newColors)
            }
        }
    }

    const handleInputChange = (colorType: keyof CustomColors, value: string) => {
        setInputValues({ ...inputValues, [colorType]: value })

        // Auto-format hex values
        let formattedValue = value
        if (value && !value.startsWith('#')) {
            formattedValue = '#' + value
        }

        // Validate and update if it's a valid hex color
        const hexRegex = /^#[0-9A-Fa-f]{6}$/
        if (hexRegex.test(formattedValue)) {
            handleColorChange(colorType, formattedValue, false) // Manual input always saves
        }
    }

    const handleColorInputChange = (colorType: keyof CustomColors, value: string) => {
        // Always treat color picker changes as potential drags initially
        const isFromDrag = isDraggingRef.current[colorType] || false
        handleColorChange(colorType, value, isFromDrag)
    }

    const handleColorInputStart = (colorType: keyof CustomColors) => {
        // Set a timeout to determine if this is a real drag operation
        dragTimeoutRef.current[colorType] = window.setTimeout(() => {
            isDraggingRef.current[colorType] = true
        }, 100) // 100ms delay to distinguish click from drag
    }

    const handleColorInputEnd = (colorType: keyof CustomColors) => {
        // Clear the timeout
        if (dragTimeoutRef.current[colorType]) {
            clearTimeout(dragTimeoutRef.current[colorType]!)
            dragTimeoutRef.current[colorType] = null
        }

        // If we were dragging, save the final color
        if (isDraggingRef.current[colorType]) {
            isDraggingRef.current[colorType] = false
            onColorsChange(colors)
        } else {
            // If it was just a click (no drag), save immediately
            onColorsChange(colors)
        }
    }

    // Add change event handler that waits a bit before saving
    const handleColorInputChangeDelayed = (colorType: keyof CustomColors, value: string) => {
        handleColorChange(colorType, value, true) // Treat as drag initially

        // Set a timeout to save if no more changes come
        if (dragTimeoutRef.current[`save-${colorType}`]) {
            clearTimeout(dragTimeoutRef.current[`save-${colorType}`]!)
        }

        dragTimeoutRef.current[`save-${colorType}`] = window.setTimeout(() => {
            onColorsChange({ ...colors, [colorType]: value })
        }, 300) // Save after 300ms of no changes
    }

    const resetToDefaults = () => {
        setColors(defaultColors)
        setInputValues(defaultColors)
        onColorsChange(defaultColors)
        onPreview?.(defaultColors)
    }

    const colorConfigs = [
        {
            key: 'primary' as const,
            label: 'Primary Color',
            description: 'Main brand color for buttons and highlights'
        },
        {
            key: 'secondary' as const,
            label: 'Secondary Color',
            description: 'Supporting color for gradients and accents'
        },
        {
            key: 'accent' as const,
            label: 'Accent Color',
            description: 'Border and accent color for details'
        }
    ]

    return (
        <Card className="p-6 bg-glass/50 backdrop-blur-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-cyber-pink" />
                    <h3 className="text-lg font-semibold text-white">Custom Colors</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetToDefaults}
                    className="text-gray-400 hover:text-white"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                </Button>
            </div>

            <div className="space-y-6">
                {colorConfigs.map((config, index) => (
                    <motion.div
                        key={config.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-3"
                    >
                        <Label className="text-white font-medium">
                            {config.label}
                        </Label>
                        <p className="text-sm text-gray-400 mb-2">
                            {config.description}
                        </p>

                        <div className="flex items-center gap-3">
                            {/* Color Preview Circle */}
                            <div
                                className="w-12 h-12 rounded-full border-2 border-white/20 flex-shrink-0 cursor-pointer relative overflow-hidden"
                                style={{ backgroundColor: colors[config.key] }}
                                onClick={() => {
                                    // Trigger the hidden color input
                                    const colorInput = document.getElementById(`color-${config.key}`) as HTMLInputElement
                                    colorInput?.click()
                                }}
                            >
                                {/* Hidden native color picker */}
                                <input
                                    id={`color-${config.key}`}
                                    type="color"
                                    value={colors[config.key]}
                                    onChange={(e) => handleColorInputChangeDelayed(config.key, e.target.value)}
                                    onMouseDown={() => handleColorInputStart(config.key)}
                                    onMouseUp={() => handleColorInputEnd(config.key)}
                                    onTouchStart={() => handleColorInputStart(config.key)}
                                    onTouchEnd={() => handleColorInputEnd(config.key)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            {/* Hex Input */}
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    value={inputValues[config.key]}
                                    onChange={(e) => handleInputChange(config.key, e.target.value)}
                                    placeholder="#000000"
                                    className="bg-black/20 border-white/10 text-white font-mono"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Color Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 p-4 rounded-lg border border-white/10"
                    style={{
                        background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}15 50%, ${colors.accent}20 100%)`
                    }}
                >
                    <h4 className="text-white font-medium mb-3">Preview</h4>
                    <div className="flex gap-3">
                        <div
                            className="flex-1 h-8 rounded border-2"
                            style={{
                                backgroundColor: `${colors.primary}30`,
                                borderColor: colors.primary
                            }}
                        />
                        <div
                            className="flex-1 h-8 rounded border-2"
                            style={{
                                backgroundColor: `${colors.secondary}30`,
                                borderColor: colors.secondary
                            }}
                        />
                        <div
                            className="flex-1 h-8 rounded border-2"
                            style={{
                                backgroundColor: `${colors.accent}30`,
                                borderColor: colors.accent
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </Card>
    )
} 