'use client'

import { motion } from 'framer-motion'
import { type IconStyle } from '@/stores/useThemeStore'

interface IconStyleSelectorProps {
    value: IconStyle
    onChange: (style: IconStyle) => void
    disabled?: boolean
}

export function IconStyleSelector({ value, onChange, disabled }: IconStyleSelectorProps) {
    const options: { value: IconStyle; label: string; description: string }[] = [
        {
            value: 'monochrome',
            label: 'Monochrome',
            description: 'All icons in white/gray'
        },
        {
            value: 'colored',
            label: 'Colored',
            description: 'Brand colors (YouTube red, etc.)'
        },
        {
            value: 'theme',
            label: 'Theme Colors',
            description: 'Icons match your theme'
        }
    ]

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium text-white">Icon Style</div>
            <div className="space-y-2">
                {options.map((option) => (
                    <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => !disabled && onChange(option.value)}
                        disabled={disabled}
                        className={`
              w-full flex items-start gap-3 p-3 rounded-lg border transition-all
              ${value === option.value
                                ? 'bg-cyber-primary/20 border-cyber-primary text-white'
                                : 'bg-glass/50 border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
                            }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
                        whileHover={!disabled ? { scale: 1.02 } : {}}
                        whileTap={!disabled ? { scale: 0.98 } : {}}
                    >
                        <div className={`
              w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center
              ${value === option.value
                                ? 'border-cyber-primary bg-cyber-primary'
                                : 'border-gray-400'
                            }
            `}>
                            {value === option.value && (
                                <motion.div
                                    className="w-2 h-2 bg-white rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                        </div>
                        <div className="flex-1 text-left">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-400 mt-1">{option.description}</div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    )
} 