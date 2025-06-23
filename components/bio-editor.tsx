'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { Edit3 } from '@/lib/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface BioEditorProps {
    userId: string
    initialBio?: string
    onBioUpdate?: (newBio: string) => void
    className?: string
}

const MAX_BIO_LENGTH = 300

export function BioEditor({ userId, initialBio = '', onBioUpdate, className = '' }: BioEditorProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [bio, setBio] = useState(initialBio)
    const [tempBio, setTempBio] = useState(initialBio)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const supabase = createClientComponentClient()
    const queryClient = useQueryClient()

    useEffect(() => {
        setBio(initialBio)
        setTempBio(initialBio)
    }, [initialBio])

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
            // Auto-resize the textarea to fit content
            autoResizeTextarea()
        }
    }, [isEditing])

    const autoResizeTextarea = () => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto'
            inputRef.current.style.height = `${Math.max(inputRef.current.scrollHeight, 40)}px`
        }
    }

    const updateBioMutation = useMutation({
        mutationFn: async (newBio: string) => {
            const { error } = await supabase
                .from('twitch_users')
                .update({ custom_bio: newBio || null })
                .eq('id', userId)

            if (error) throw error
            return newBio
        },
        onSuccess: (newBio) => {
            setBio(newBio)
            setIsEditing(false)
            onBioUpdate?.(newBio)
            toast.success('Bio updated!')
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        },
        onError: (error) => {
            console.error('Error updating bio:', error)
            toast.error('Failed to update bio')
            setTempBio(bio) // Reset to original
        }
    })

    const handleSave = () => {
        if (tempBio.length > MAX_BIO_LENGTH) {
            toast.error(`Bio must be ${MAX_BIO_LENGTH} characters or less`)
            return
        }
        updateBioMutation.mutate(tempBio.trim())
    }

    const handleCancel = () => {
        setTempBio(bio)
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSave()
        } else if (e.key === 'Escape') {
            handleCancel()
        }
    }

    const handleBlur = () => {
        // Small delay to allow for clicking the edit button
        setTimeout(() => {
            if (isEditing) {
                handleSave()
            }
        }, 100)
    }

    const handleDoubleClick = () => {
        if (!isEditing) {
            setIsEditing(true)
        }
    }

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTempBio(e.target.value)
        // Auto-resize as user types
        setTimeout(autoResizeTextarea, 0)
    }

    if (isEditing) {
        return (
            <div className="relative w-full max-w-none flex justify-center">
                <div className="w-full max-w-2xl">
                    <textarea
                        ref={inputRef}
                        value={tempBio}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        placeholder="Tell people about yourself..."
                        className="w-full bg-transparent border-none outline-none resize-none text-foreground/90 font-body leading-relaxed placeholder:text-muted-foreground overflow-hidden text-center"
                        style={{
                            minHeight: '40px',
                            maxHeight: '200px'
                        }}
                        disabled={updateBioMutation.isPending}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-muted-foreground">
                            Press Enter to save, Escape to cancel
                        </div>
                        <div className={`text-xs ${tempBio.length > MAX_BIO_LENGTH ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {tempBio.length}/{MAX_BIO_LENGTH}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`group relative ${className}`}>
            {bio ? (
                <p
                    className="text-foreground/90 font-body leading-relaxed whitespace-pre-wrap pr-8 cursor-pointer"
                    onDoubleClick={handleDoubleClick}
                    title="Double-click to edit"
                >
                    {bio}
                </p>
            ) : (
                <p
                    className="text-muted-foreground italic font-body pr-8 cursor-pointer"
                    onDoubleClick={handleDoubleClick}
                    title="Double-click to add a bio"
                >
                    Add a bio to tell visitors about yourself
                </p>
            )}
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/10 rounded"
                disabled={updateBioMutation.isPending}
                title="Click to edit bio"
            >
                <Edit3 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
        </div>
    )
} 