"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  ExternalLink,
  Twitter,
  Youtube,
  Twitch,
  Instagram,
  Facebook,
  Github,
  Linkedin,
  Globe,
  Link as LinkIcon,
  Rocket,
  Music,
  Store,
  DollarSign,
} from "lucide-react"
import { 
  SiDiscord, 
  SiTiktok, 
  SiKick,
  SiKofi,
  SiPatreon,
  SiOnlyfans,
  SiCashapp,
  SiVenmo,
  SiPaypal,
  SiSpotify,
  SiSoundcloud,
  SiBandcamp,
  SiThreads,
  SiSubstack,
  SiMedium,
} from '@icons-pack/react-simple-icons'
import { Reorder, motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/alert-dialog"

const platformIcons: Record<string, any> = {
  // Social Media
  twitter: Twitter,
  youtube: Youtube,
  twitch: Twitch,
  instagram: Instagram,
  facebook: Facebook,
  github: Github,
  linkedin: Linkedin,
  discord: SiDiscord,
  tiktok: SiTiktok,
  kick: SiKick,
  threads: SiThreads,

  // Content Creation
  streamelements: Rocket,
  kofi: SiKofi,
  fourthwall: Store,
  patreon: SiPatreon,
  onlyfans: SiOnlyfans,

  // Payment/Support
  cashapp: SiCashapp,
  venmo: SiVenmo,
  paypal: SiPaypal,

  // Music/Audio
  spotify: SiSpotify,
  soundcloud: SiSoundcloud,
  bandcamp: SiBandcamp,
  music: Music,

  // Writing/Blogs
  substack: SiSubstack,
  medium: SiMedium,

  // Generic
  website: Globe,
  link: LinkIcon,
}

const platformColors: Record<string, string> = {
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  twitch: '#9146FF',
  instagram: '#E4405F',
  discord: '#5865F2',
  tiktok: '#000000',
  kick: '#53FC18',
  kofi: '#FF5E5B',
  patreon: '#FF424D',
  onlyfans: '#00AFF0',
  spotify: '#1DB954',
  streamelements: '#F43B4E',
}

function getPlatformIcon(platform: string) {
  const normalizedPlatform = platform.toLowerCase().trim()
  const Icon = platformIcons[normalizedPlatform] || platformIcons.link
  return Icon
}

function getPlatformColor(platform: string) {
  const normalizedPlatform = platform.toLowerCase().trim()
  return platformColors[normalizedPlatform] || 'currentColor'
}

interface SocialLink {
  id: string
  user_id: string
  platform: string
  url: string
  title: string
  order_index: number
}

interface SocialLinksManagerProps {
  initialLinks: SocialLink[];
  user: {
    id: string;
    twitch_user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

function AddLinkDialog({ userId, onAdd }: { 
  userId: string, 
  onAdd: () => void 
}) {
  const [platform, setPlatform] = useState("")
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Adding link with userId:', userId);
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('social_tree')
        .insert([
          {
            user_id: userId,
            platform,
            url,
            title: title || platform,
            order_index: 999 // Will be reordered by drag and drop
          }
        ])

      if (error) throw error
      onAdd()
      setPlatform("")
      setUrl("")
      setTitle("")
    } catch (error) {
      console.error('Error adding link:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add New Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Social Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            value={platform}
            onValueChange={setPlatform}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Platform" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(platformIcons).map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <Input
            placeholder="Display Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
            <Button 
              type="submit" 
              disabled={!platform || !url || isSubmitting}
            >
              Add Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SocialLinksManager({ initialLinks = [], user }: SocialLinksManagerProps) {
  console.log('SocialLinksManager render:', { initialLinks, user });
  
  if (!user) {
    console.error('User object is undefined');
    return <div>Error: Missing user data</div>;
  }

  if (!user.twitch_user_id) {
    console.error('Missing twitch_user_id in user object:', user);
    return <div>Error: Missing Twitch user data</div>;
  }

  const [links, setLinks] = useState(initialLinks)
  const [isDragging, setIsDragging] = useState(false)
  const supabase = createClientComponentClient()

  const updateLinksOrder = async (newOrder: SocialLink[]) => {
    const updates = newOrder.map((link, index) => ({
      ...link,
      order_index: index
    }))

    const { error } = await supabase
      .from('social_tree')
      .upsert(updates, {
        onConflict: 'id',
        defaultToNull: false
      })

    if (error) {
      console.error('Error updating order:', error)
      setLinks(initialLinks)
    }
  }

  useEffect(() => {
    if (!user.twitch_user_id) return;

    const channel = supabase
      .channel(`social_tree_${user.twitch_user_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_tree',
          filter: `user_id=eq.${user.twitch_user_id}`
        },
        async () => {
          if (!isDragging) {
            const { data: freshLinks } = await supabase
              .from('social_tree')
              .select('*')
              .eq('user_id', user.twitch_user_id)
              .order('order_index', { ascending: true })

            if (freshLinks) setLinks(freshLinks)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, user.twitch_user_id, isDragging])

  const handleReorder = (newOrder: SocialLink[]) => {
    setLinks(newOrder)
    updateLinksOrder(newOrder)
  }

  const deleteLink = async (id: string) => {
    try {
      setLinks((currentLinks) => currentLinks.filter(link => link.id !== id))

      const { error } = await supabase
        .from('social_tree')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting link:', error)
        setLinks(initialLinks)
        throw error
      }
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  return (
    <div className="space-y-4">
      <AddLinkDialog 
        userId={user.twitch_user_id}
        onAdd={() => {}} // Realtime will handle the update
      />

      <Reorder.Group
        axis="y"
        values={links}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {links.map((link) => {
          const Icon = getPlatformIcon(link.platform)
          const iconColor = getPlatformColor(link.platform)
          
          return (
            <Reorder.Item
              key={link.id}
              value={link}
              className="bg-glass rounded-xl shadow-glass hover:shadow-cyber 
                       transition-all duration-300"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" style={{ color: iconColor }} />
                    <h3 className="font-medium">{link.title || link.platform}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <p className="truncate">{link.url}</p>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1 hover:text-foreground"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Link</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this link? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          deleteLink(link.id)
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Reorder.Item>
          )
        })}
      </Reorder.Group>
    </div>
  )
} 