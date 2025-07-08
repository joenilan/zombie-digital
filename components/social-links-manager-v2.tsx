'use client'

import React, { useState, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GripVertical, Trash2, ExternalLink, Plus, Pencil, InfoIcon, ArrowUpDown, Search, X, Check, Link2 } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { CopyButton, EditButton, DeleteButton } from '@/components/ui/action-button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { getPlatformIcon, getPlatformColor, platformIcons, platformUrlPatterns, getPlatformUrl } from '@/lib/icons'
import { getIconStyle } from '@/lib/icon-utils'
import { useSocialLinksManagerStore, type SocialLink } from '@/stores/useSocialLinksManagerStore'
import { type IconStyle } from '@/stores/useThemeStore'
import { type ColorScheme } from '@/lib/theme-system'
import { useQuery } from '@tanstack/react-query'

// Constants
const ItemTypes = {
  SOCIAL_LINK: 'social-link'
}

interface DraggableLinkProps {
  link: SocialLink
  index: number
  moveLink: (dragIndex: number, hoverIndex: number) => void
  onDelete: (id: string) => void
  onDrop: () => void
  onEdit: (link: SocialLink) => void
  isDragging: boolean
  iconStyle?: IconStyle
  activeTheme?: ColorScheme | null
}

// DecAPI hooks for Twitch info
function useTwitchUptime(channel: string) {
  return useQuery<{ live: boolean; uptime: string | null }, Error>({
    queryKey: ['twitch-uptime', channel],
    queryFn: async () => {
      const res = await fetch(`https://decapi.me/twitch/uptime/${channel}`)
      if (!res.ok) throw new Error('DecAPI error')
      const text = await res.text()
      if (text.includes('offline')) {
        return { live: false, uptime: null }
      }
      return { live: true, uptime: text }
    },
    staleTime: 60_000,
    retry: 1,
  })
}
function useTwitchViewerCount(channel: string) {
  return useQuery<number | null, Error>({
    queryKey: ['twitch-viewercount', channel],
    queryFn: async () => {
      const res = await fetch(`https://decapi.me/twitch/viewercount/${channel}`)
      if (!res.ok) throw new Error('DecAPI error')
      const text = await res.text()
      if (text.includes('offline')) return null
      return parseInt(text, 10)
    },
    staleTime: 60_000,
    retry: 1,
  })
}
function useTwitchTitle(channel: string) {
  return useQuery<string | null, Error>({
    queryKey: ['twitch-title', channel],
    queryFn: async () => {
      const res = await fetch(`https://decapi.me/twitch/title/${channel}`)
      if (!res.ok) throw new Error('DecAPI error')
      const text = await res.text()
      if (text.includes('offline')) return null
      return text
    },
    staleTime: 60_000,
    retry: 1,
  })
}

const DraggableLink = ({ link, index, moveLink, onDelete, onDrop, onEdit, isDragging, iconStyle = 'colored', activeTheme }: DraggableLinkProps) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const Icon = getPlatformIcon(link.platform)
  const iconColor = getPlatformColor(link.platform)

  // Drag source
  const [{ isDragging: isCurrentlyDragging }, drag] = useDrag({
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
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.SOCIAL_LINK,
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return

      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return

      moveLink(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
    collect: monitor => ({
      isOver: monitor.isOver()
    })
  })

  // Combine drag and drop refs
  drag(drop(ref))

  // Handle double-click to edit
  const handleDoubleClick = () => {
    onEdit(link)
  }

  // --- DecAPI Twitch info for secondary Twitch links ---
  // Only show for platform 'twitch' and not the main user's own account
  let twitchChannel = ''
  if (link.platform === 'twitch') {
    // Try to extract the channel name from the URL
    try {
      const url = new URL(link.url)
      twitchChannel = url.pathname.replace(/^\//, '').toLowerCase()
    } catch {
      // fallback: try to use the title or url as channel name
      twitchChannel = link.title?.toLowerCase() || ''
    }
  }
  // Assume main user's Twitch username is passed via activeTheme?.mainTwitchUsername (or similar prop if available)
  // For now, just show DecAPI info for all Twitch links
  const showTwitchInfo = link.platform === 'twitch' && twitchChannel
  const { data: uptime, isLoading: uptimeLoading, isError: uptimeError } = useTwitchUptime(twitchChannel)
  const { data: viewers, isLoading: viewersLoading, isError: viewersError } = useTwitchViewerCount(twitchChannel)
  const { data: title, isLoading: titleLoading, isError: titleError } = useTwitchTitle(twitchChannel)

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      className={`group relative flex items-center gap-4 py-2.5 px-3
                ${isOver ? 'bg-primary/5' : ''}
                ${isCurrentlyDragging ? 'scale-[1.02] shadow-lg' : 'hover:bg-muted/30'}
                rounded-xl transition-all duration-200 cursor-grab active:cursor-grabbing
                bg-background`}
    >
      <div className="flex items-center justify-center w-8 h-8 text-muted-foreground/60 group-hover:text-foreground/80 transition-colors duration-200">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
        <div
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg"
          style={{ background: iconColor }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className="font-medium truncate cursor-pointer text-foreground text-base transition-opacity hover:opacity-80"
            onDoubleClick={handleDoubleClick}
            title="Double-click to edit"
          >
            {link.title || link.platform}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <p
              className="truncate cursor-pointer transition-all hover:opacity-80"
              onDoubleClick={handleDoubleClick}
              title="Double-click to edit"
            >
              {link.url}
            </p>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 p-1 hover:text-foreground"
              title="Open link in new tab"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          {/* --- Twitch status/info for secondary Twitch links --- */}
          {showTwitchInfo && !uptimeLoading && !uptimeError && uptime && typeof uptime === 'object' && 'live' in uptime && (
            <div className="flex items-center gap-2 mt-1 text-xs">
              {uptime.live ? (
                <span className="text-green-500 font-semibold">LIVE{uptime.uptime ? ` (${uptime.uptime})` : ''}</span>
              ) : (
                <span className="text-gray-400">Offline</span>
              )}
              {uptime.live && !viewersLoading && !viewersError && typeof viewers === 'number' && (
                <span className="text-cyan-400 ml-2">👁️ {viewers}</span>
              )}
              {uptime.live && !titleLoading && !titleError && typeof title === 'string' && title && (
                <span className="ml-2 text-foreground/70 truncate max-w-[180px]">{title}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Edit Button */}
        <button
          type="button"
          className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
          onClick={() => onEdit(link)}
          title="Edit link"
        >
          <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          className="p-1.5 rounded-full hover:bg-red-500/10 transition-colors"
          onClick={() => {
            if (confirm('Are you sure you want to delete this link?')) {
              onDelete(link.id)
            }
          }}
          title="Delete link"
        >
          <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
        </button>
      </div>
    </div>
  )
}

// Edit Link Dialog Component
const EditLinkDialog = ({
  link,
  userId,
  onUpdate,
  open,
  onOpenChange
}: {
  link: SocialLink | null,
  userId: string,
  onUpdate: () => void,
  open: boolean,
  onOpenChange: (open: boolean) => void
}) => {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const supabase = createClientComponentClient()

  // When the dialog opens with a link, populate the form fields
  React.useEffect(() => {
    if (link && open) {
      setUrl(link.url)
      setTitle(link.title || '')
    }
  }, [link, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!link) return

    try {
      const { error } = await supabase
        .from('social_tree')
        .update({
          url: url,
          title: title || link.platform.charAt(0).toUpperCase() + link.platform.slice(1)
        })
        .eq('id', link.id)

      if (error) throw error

      onOpenChange(false)
      onUpdate()
      toast.success('Social link updated', {
        description: 'Your changes have been saved and will update on your profile in real-time',
        duration: 3000,
        action: {
          label: "View Profile",
          onClick: () => {
            // Get username from current user context or URL
            const username = window.location.pathname.includes('/dashboard')
              ? window.location.pathname.split('/')[1]
              : 'profile'
            window.open(`/${username}`, '_blank')
          },
        },
      })
    } catch (error) {
      console.error('Error updating link:', error)
      toast.error('Failed to update link')
    }
  }

  if (!link) return null

  const Icon = getPlatformIcon(link.platform)
  const iconColor = getPlatformColor(link.platform)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 shadow-xl bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
            <span>Edit {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} Link</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-muted-foreground">URL</Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/username"
                required
                className="pl-10 bg-muted/20 border-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-muted-foreground">
              Display Name <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Input
              id="title"
              placeholder="Custom display name"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-muted/20 border-0"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="cyber-pink" icon={<X className="w-4 h-4" />} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!url} variant="cyber-cyan" icon={<Check className="w-4 h-4" />}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Platform Selector component for Add Link
const PlatformSelector = ({ value, onChange }: { value: string, onChange: (platform: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const sortedPlatforms = Object.keys(platformIcons).filter(p => p !== 'other').sort()

  const filteredPlatforms = searchTerm
    ? sortedPlatforms.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
    : sortedPlatforms

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 p-3 rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? (
          <>
            {React.createElement(getPlatformIcon(value), {
              className: "w-5 h-5",
              style: { color: getPlatformColor(value) }
            })}
            <span className="font-medium">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Select a platform</span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-lg bg-background shadow-lg border-0 max-h-[300px] overflow-y-auto"
          >
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search platforms..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/20 border-0"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-1 mt-2">
              {filteredPlatforms.map(platform => (
                <div
                  key={platform}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    onChange(platform)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                >
                  {React.createElement(getPlatformIcon(platform), {
                    className: "w-4 h-4",
                    style: { color: getPlatformColor(platform) }
                  })}
                  <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                </div>
              ))}

              {filteredPlatforms.length === 0 && (
                <div className="col-span-2 p-4 text-center text-muted-foreground">
                  No matching platforms found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Add Link Component
const AddLink = ({ userId, onAdd, open, onOpenChange }: {
  userId: string,
  onAdd: () => void,
  open: boolean,
  onOpenChange: (open: boolean) => void
}) => {
  const [platform, setPlatform] = useState('')
  const [username, setUsername] = useState('')
  const [title, setTitle] = useState('')
  const supabase = createClientComponentClient()

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setPlatform('')
      setUsername('')
      setTitle('')
    }
  }, [open])

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

      // Reset form
      setPlatform('')
      setUsername('')
      setTitle('')
      onOpenChange(false)

      // Notify parent
      onAdd()

      toast.success('Social link added', {
        description: 'Your new link has been added and will appear on your profile in real-time',
        duration: 3000,
        action: {
          label: "View Profile",
          onClick: () => {
            window.open(`/${window.location.pathname.split('/')[1]}`, '_blank')
          },
        },
      })
    } catch (error) {
      console.error('Error adding link:', error)
      toast.error('Failed to add link')
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

    return 'username'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
      <div className="space-y-2">
        <Label htmlFor="platform" className="text-muted-foreground">Platform</Label>
        <PlatformSelector value={platform} onChange={setPlatform} />
      </div>

      {platform && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="username" className="text-muted-foreground">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={getPlaceholder()}
              required
              className="bg-muted/20 border-0"
            />
            {username && (
              <p className="text-sm text-muted-foreground/70 flex items-center gap-1 mt-1 pl-1">
                <InfoIcon className="w-3 h-3" />
                <span>Link will be: {getPlatformUrl(platform, username)}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-muted-foreground">
              Display Name <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Input
              id="title"
              placeholder={platform.charAt(0).toUpperCase() + platform.slice(1)}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-muted/20 border-0"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="cyber-pink" icon={<X className="w-4 h-4" />} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!platform || !username} variant="cyber-cyan" icon={<Plus className="w-4 h-4" />}>
              Add Link
            </Button>
          </div>
        </motion.div>
      )}
    </form>
  )
}

// Empty State Component
const EmptyState = ({ onAddClick }: { onAddClick: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg bg-background"
    >
      <div className="w-20 h-20 mb-6 relative">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="relative flex items-center justify-center w-full h-full rounded-full bg-muted/20">
          <Link2 className="w-8 h-8 text-primary" />
        </div>
      </div>

      <h3 className="text-xl font-medium mb-2">No links added yet</h3>

      <p className="text-muted-foreground max-w-sm mb-6">
        Connect with your audience by adding links to your social profiles, websites, or other platforms.
      </p>

      <Button
        onClick={onAddClick}
        variant="ethereal"
        icon={<Plus className="w-4 h-4" />}
        className="px-6 py-2 h-auto text-base"
      >
        Add Your First Link
      </Button>
    </motion.div>
  )
}

export function SocialLinksManagerV2({ initialLinks = [], twitchUserId, onLinksChange, iconStyle = 'colored', activeTheme }: {
  initialLinks: SocialLink[]
  twitchUserId: string
  onLinksChange?: (links: SocialLink[]) => void
  iconStyle?: IconStyle
  activeTheme?: ColorScheme | null
}) {
  const {
    links,
    editingLink,
    isEditDialogOpen,
    isDraggingAny,
    isAddDialogOpen,
    newLinkPlatform,
    setLinks,
    openEditDialog,
    closeEditDialog,
    openAddDialog,
    closeAddDialog,
    setIsDraggingAny,
    setNewLinkPlatform,
    reorderLinks,
    removeLink,
    addLink
  } = useSocialLinksManagerStore()

  const queryClient = useQueryClient()
  const supabase = createClientComponentClient()

  // Update store when props change
  useEffect(() => {
    setLinks(initialLinks)
  }, [initialLinks, setLinks])

  // We remove the real-time subscription since the parent component now handles this

  const moveLink = (dragIndex: number, hoverIndex: number) => {
    const newLinks = [...links]
    const [removed] = newLinks.splice(dragIndex, 1)
    newLinks.splice(hoverIndex, 0, removed)
    reorderLinks(newLinks)
  }

  const handleDrop = async () => {
    setIsDraggingAny(false)

    try {
      const updates = links.map((link, index) => ({
        ...link,
        order_index: index
      }))

      const { error } = await supabase
        .from('social_tree')
        .upsert(updates)

      if (error) throw error

      // Notify parent of changes
      if (onLinksChange) {
        onLinksChange(links)
      }

      toast.success('Links reordered', {
        description: 'Your links have been reordered and will update on your profile',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_tree')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Use Zustand store action
      removeLink(id)

      // Notify parent of changes
      if (onLinksChange) {
        onLinksChange(links.filter(link => link.id !== id))
      }

      toast.success('Link deleted', {
        description: 'Your link has been removed and will update on your profile in real-time',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error deleting link:', error)
      toast.error('Failed to delete link')
    }
  }

  const handleEditLink = (link: SocialLink) => {
    openEditDialog(link)
  }

  const handleUpdateLink = () => {
    // No need to manually update state since we have real-time subscription
  }

  const handleAddLink = async (platform: string, username: string, displayTitle?: string) => {
    try {
      // Generate the full URL from username
      const finalUrl = getPlatformUrl(platform, username)

      // Capitalize the first letter of the platform for the default title
      const defaultTitle = platform.charAt(0).toUpperCase() + platform.slice(1)
      const title = displayTitle || defaultTitle

      const { data: newLink, error } = await supabase
        .from('social_tree')
        .insert([{
          user_id: twitchUserId,
          platform,
          url: finalUrl,
          title: title,
          order_index: links.length // Add at the end
        }])
        .select()
        .single()

      if (error) throw error

      closeAddDialog()
      setNewLinkPlatform('')

      // If we have the newly created link data, use it to update the UI immediately
      if (newLink) {
        const updatedLinks = [...links, newLink]
        setLinks(updatedLinks)

        // Notify parent component of the change
        if (onLinksChange) {
          onLinksChange(updatedLinks)
        }
      }

      toast.success('Social link added', {
        description: 'Your new link has been added and will appear on your profile in real-time',
        duration: 3000,
        action: {
          label: "View Profile",
          onClick: () => {
            window.open(`/${window.location.pathname.split('/')[1]}`, '_blank')
          },
        },
      })
    } catch (error) {
      console.error('Error adding link:', error)
      toast.error('Failed to add link')
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full">
        <div className="space-y-6">
          {links.length === 0 ? (
            <EmptyState onAddClick={() => openAddDialog()} />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <InfoIcon className="w-4 h-4" />
                  <span>Double-click any link to edit its details</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ArrowUpDown className="w-4 h-4" />
                    <span>Drag to reorder</span>
                  </div>

                  <CopyButton
                    onClick={() => openAddDialog()}
                    tooltip="Add new social link"
                    size="sm"
                    className="whitespace-nowrap !flex !items-center !flex-row min-w-fit"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>Add Link</span>
                    </div>
                  </CopyButton>
                </div>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {links.map((link, index) => (
                    <DraggableLink
                      key={link.id}
                      link={link}
                      index={index}
                      moveLink={moveLink}
                      onDelete={deleteLink}
                      onDrop={handleDrop}
                      onEdit={handleEditLink}
                      isDragging={isDraggingAny}
                      iconStyle={iconStyle}
                      activeTheme={activeTheme}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={closeAddDialog}>
        <DialogContent className="max-w-md border-0 shadow-xl bg-background">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Social Link</DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const platform = newLinkPlatform;
            const username = formData.get('username') as string;
            const title = formData.get('title') as string;

            if (platform && username) {
              handleAddLink(platform, username, title || undefined);
            }
          }} className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-muted-foreground">Platform</Label>
              <PlatformSelector value={newLinkPlatform} onChange={setNewLinkPlatform} />
            </div>

            {newLinkPlatform && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-muted-foreground">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder={newLinkPlatform ? `Enter your ${newLinkPlatform} username` : 'Choose a platform first'}
                    required
                    className="bg-muted/20 border-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-muted-foreground">
                    Display Name <span className="text-muted-foreground/60">(optional)</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder={newLinkPlatform.charAt(0).toUpperCase() + newLinkPlatform.slice(1)}
                    className="bg-muted/20 border-0"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <DeleteButton
                    type="button"
                    tooltip="Cancel adding link"
                    className="whitespace-nowrap flex items-center"
                    onClick={() => {
                      closeAddDialog();
                      setNewLinkPlatform('');
                    }}
                  >
                    <X className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="flex-shrink-0">Cancel</span>
                  </DeleteButton>
                  <CopyButton
                    type="submit"
                    disabled={!newLinkPlatform}
                    tooltip="Create new social link"
                    className="whitespace-nowrap flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="flex-shrink-0">Add Link</span>
                  </CopyButton>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      <EditLinkDialog
        link={editingLink}
        userId={twitchUserId}
        onUpdate={handleUpdateLink}
        open={isEditDialogOpen}
        onOpenChange={closeEditDialog}
      />
    </DndProvider>
  )
}
