'use client'

import React, { useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GripVertical, Trash2, ExternalLink, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { platformIcons, platformColors, getPlatformIcon, getPlatformColor, getPlatformUrl, platformUrlPatterns } from '@/lib/platform-icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Constants
const ItemTypes = {
  SOCIAL_LINK: 'social-link'
}

export interface SocialLink {
  id: string
  user_id: string
  platform: string
  url: string
  title: string
  order_index: number
}

interface DraggableLinkProps {
  link: SocialLink
  index: number
  moveLink: (dragIndex: number, hoverIndex: number) => void
  onDelete: (id: string) => void
  onDrop: () => void
}

const DraggableLink = ({ link, index, moveLink, onDelete, onDrop }: DraggableLinkProps) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const Icon = getPlatformIcon(link.platform)
  const iconColor = getPlatformColor(link.platform)

  // Drag source
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SOCIAL_LINK,
    item: { index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    }),
    end: (_, monitor) => {
      if (monitor.didDrop()) {
        onDrop()
      }
    }
  })

  // Drop target
  const [, drop] = useDrop({
    accept: ItemTypes.SOCIAL_LINK,
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return

      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return

      moveLink(dragIndex, hoverIndex)
      item.index = hoverIndex
    }
  })

  // Combine drag and drop refs
  drag(drop(ref))

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`group relative flex items-center gap-3 p-3 bg-background/50 
                 hover:bg-background/80 rounded-lg border border-border/50 
                 hover:border-border transition-all duration-200
                 ${isDragging ? 'border-primary' : ''}`}
    >
      <div className="text-muted-foreground/50 group-hover:text-muted-foreground pointer-events-none">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: iconColor }} />
        <div className="min-w-0">
          <h3 className="font-medium truncate">
            {link.title || link.platform}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <p className="truncate">{link.url}</p>
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1 hover:text-foreground"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-left">Delete {link.platform} Link</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-muted-foreground">
              Are you sure you want to delete this link? This action cannot be undone.
            </p>
            <div className="mt-1 p-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: iconColor }} />
                <span className="font-medium">{link.title || link.platform}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground truncate">
                {link.url}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
            <Button 
              variant="destructive"
              onClick={() => onDelete(link.id)}
            >
              Delete Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const AddLinkDialog = ({ userId, onAdd }: { userId: string, onAdd: () => void }) => {
  const [platform, setPlatform] = useState('')
  const [username, setUsername] = useState('')
  const [title, setTitle] = useState('')
  const [open, setOpen] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Generate the full URL from username
      const finalUrl = getPlatformUrl(platform, username)

      // Capitalize the first letter of the platform for the default title
      const defaultTitle = platform.charAt(0).toUpperCase() + platform.slice(1)

      const { error } = await supabase
        .from('social_tree')
        .insert([{
          user_id: userId,
          platform,
          url: finalUrl,
          title: title || defaultTitle,
          order_index: 0 // Will be updated by the backend
        }])

      if (error) throw error
      
      setOpen(false)
      setPlatform('')
      setUsername('')
      setTitle('')
      onAdd()
      toast.success('Social link added successfully')
    } catch (error) {
      console.error('Error adding link:', error)
      toast.error('Failed to add social link')
    }
  }

  // Get the placeholder text based on the platform
  const getPlaceholder = () => {
    if (!platform) return 'Choose a platform first'
    
    const pattern = platformUrlPatterns[platform]
    if (!pattern) return 'username'

    // Special cases
    if (platform === 'substack' || platform === 'tumblr' || platform === 'shopify') {
      return 'your-site-name'
    }

    if (platform === 'fourthwall') {
      return 'username or custom domain'
    }

    // Remove common parts from the pattern to show a cleaner placeholder
    return 'username'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full group">
          <Plus className="w-4 h-4 mr-2 group-hover:text-primary" />
          Add Social Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Social Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform} required>
              <SelectTrigger id="platform" className="w-full">
                <SelectValue placeholder="Select a platform">
                  {platform && (
                    <div className="flex items-center gap-2">
                      {React.createElement(getPlatformIcon(platform), {
                        className: "w-4 h-4",
                        style: { color: getPlatformColor(platform) }
                      })}
                      <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.keys(platformIcons)
                    .filter(p => p !== 'other')
                    .sort()
                    .map(p => (
                      <SelectItem key={p} value={p} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          {React.createElement(getPlatformIcon(p), {
                            className: "w-4 h-4",
                            style: { color: getPlatformColor(p) }
                          })}
                          <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            {platform && (
              <div className="text-sm text-muted-foreground mb-2">
                Your link will be: {getPlatformUrl(platform, username || 'username')}
              </div>
            )}
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={getPlaceholder()}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Display Name <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="title"
              placeholder="Custom display name"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!platform || !username}>
              Add Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SocialLinksManagerV2({ initialLinks = [], twitchUserId }: { 
  initialLinks: SocialLink[]
  twitchUserId: string 
}) {
  const [links, setLinks] = useState(initialLinks)
  const queryClient = useQueryClient()
  const supabase = createClientComponentClient()

  // Subscribe to real-time changes
  React.useEffect(() => {
    const channel = supabase
      .channel('social_tree_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'social_tree',
          filter: `user_id=eq.${twitchUserId}`
        },
        async (payload) => {
          // Fetch the latest data to ensure we have the correct order
          const { data: updatedLinks } = await supabase
            .from('social_tree')
            .select('*')
            .eq('user_id', twitchUserId)
            .order('order_index')

          if (updatedLinks) {
            setLinks(updatedLinks)
            queryClient.setQueryData(['social-links', twitchUserId], updatedLinks)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [twitchUserId, supabase, queryClient])

  const moveLink = (dragIndex: number, hoverIndex: number) => {
    setLinks(prevLinks => {
      const newLinks = [...prevLinks]
      const [removed] = newLinks.splice(dragIndex, 1)
      newLinks.splice(hoverIndex, 0, removed)
      return newLinks
    })
  }

  const handleDrop = async () => {
    try {
      const updates = links.map((link, index) => ({
        ...link,
        order_index: index
      }))

      const { error } = await supabase
        .from('social_tree')
        .upsert(updates)

      if (error) throw error
      queryClient.setQueryData(['social-links', twitchUserId], links)
      toast.success('Links reordered successfully')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update link order')
    }
  }

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_tree')
        .delete()
        .eq('id', id)

      if (error) throw error

      setLinks(prevLinks => prevLinks.filter(link => link.id !== id))
      toast.success('Social link deleted successfully')
    } catch (error) {
      console.error('Error deleting link:', error)
      toast.error('Failed to delete social link')
    }
  }

  const handleAddLink = () => {
    // No need to manually invalidate since we have real-time subscription
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-3">
        <AddLinkDialog userId={twitchUserId} onAdd={handleAddLink} />
        <div className="space-y-2">
          {links.map((link, index) => (
            <DraggableLink
              key={link.id}
              link={link}
              index={index}
              moveLink={moveLink}
              onDelete={deleteLink}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  )
} 