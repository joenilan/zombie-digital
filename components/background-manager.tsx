"use client"

import { useState, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Upload, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface BackgroundData {
  url: string | null
  type: string | null
}

interface BackgroundManagerProps {
  userId: string
  currentBackground?: BackgroundData
  onUpdate?: (background: BackgroundData) => void
}

// Database operations
async function updateBackground(supabase: any, userId: string, background: BackgroundData) {
  const { data, error } = await supabase
    .from('twitch_users')
    .update({
      background_media_url: background.url,
      background_media_type: background.type
    })
    .eq('id', userId)

  if (error) throw error
  return data
}

async function uploadBackgroundFile(supabase: any, userId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`

  console.log('Uploading new file:', fileName)
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('backgrounds')
    .upload(fileName, file, {
      upsert: true // Enable overwriting
    })

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    throw uploadError
  }

  console.log('Upload response:', uploadData)

  const { data: { publicUrl } } = supabase.storage
    .from('backgrounds')
    .getPublicUrl(fileName)

  console.log('Generated public URL:', publicUrl)
  return { url: publicUrl, type: file.type }
}

async function deleteBackgroundFile(supabase: any, url: string) {
  const match = url.match(/[a-f0-9-]+-\d+\.[a-zA-Z0-9]+/)
  const fileName = match ? match[0] : null

  if (!fileName) {
    console.warn('Could not extract filename from URL:', url)
    return null
  }

  console.log('Attempting to delete file:', fileName)
  const { data, error } = await supabase.storage
    .from('backgrounds')
    .remove([fileName])

  if (error) {
    console.error('Error deleting file:', error)
    throw error
  }

  console.log('Storage delete response:', data)
  return data
}

export function BackgroundManager({ userId, currentBackground, onUpdate }: BackgroundManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [background, setBackground] = useState(currentBackground)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()

  // Subscribe to background changes
  useEffect(() => {
    console.log('Setting up realtime subscription for user:', userId)
    const channel = supabase
      .channel(`background_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'public_profiles',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Received background update:', payload)
          const newData = payload.new as any

          if (newData) {
            console.log('Updating background state:', {
              url: newData.background_media_url,
              type: newData.background_media_type
            })
            setBackground({
              url: newData.background_media_url,
              type: newData.background_media_type
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      console.log('Cleaning up realtime subscription')
      channel.unsubscribe()
    }
  }, [supabase, userId])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/webm', 'video/mp4']
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPEG, PNG, GIF, WEBM, or MP4 file.')
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, WEBM, or MP4 file.')
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      setUploadError('File size must be less than 10MB.')
      toast.error('File size must be less than 10MB.')
      return
    }

    try {
      setIsUploading(true)
      setUploadError(null)

      // Delete existing background if any
      if (background?.url) {
        console.log('Deleting existing background:', background.url)
        await deleteBackgroundFile(supabase, background.url)
      }

      // Upload new file and get URL
      console.log('Starting new file upload')
      const newBackground = await uploadBackgroundFile(supabase, userId, file)
      console.log('New background data:', newBackground)

      // Update profile
      console.log('Updating user profile with new background')
      const updateResult = await updateBackground(supabase, userId, newBackground)
      console.log('Profile update result:', updateResult)

      // Close dialog on success
      setIsDialogOpen(false)
      toast.success('Background updated successfully')

      if (onUpdate) {
        onUpdate(newBackground)
      }

    } catch (error) {
      console.error('Error uploading background:', error)
      setUploadError('Failed to upload background. Please try again.')
      toast.error('Failed to upload background. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!background?.url) return

    try {
      setIsUploading(true)
      setUploadError(null)

      // Delete from storage first
      const deleteResult = await deleteBackgroundFile(supabase, background.url)
      console.log('Delete storage result:', deleteResult)

      // Update profile in database
      const updateResult = await updateBackground(supabase, userId, { url: null, type: null })
      console.log('Update database result:', updateResult)

      // Only close dialog and show success if both operations succeeded
      setIsDeleteDialogOpen(false)
      toast.success('Background removed successfully')

      if (onUpdate) {
        onUpdate({ url: null, type: null })
      }

    } catch (error) {
      console.error('Error deleting background:', error)
      setUploadError('Failed to delete background. Please try again.')
      toast.error('Failed to delete background. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Background
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Background</DialogTitle>
              <DialogDescription>
                Upload a background image or video for your profile. Supported formats: JPEG, PNG, GIF, WEBM, MP4. Maximum size: 10MB.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,video/webm,video/mp4"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="w-full"
              />
              {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
              )}
              {isUploading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {background?.url && (
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" disabled={isUploading}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Background</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete your profile background? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {background?.url && (
        <div className="relative h-40 rounded-lg overflow-hidden bg-black/10">
          {background.type?.startsWith('video/') ? (
            <video
              src={background.url}
              className="absolute inset-0 w-full h-full object-contain"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={background.url}
              alt="Profile Background"
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
        </div>
      )}
    </div>
  )
} 