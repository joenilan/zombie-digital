"use client"

import React from "react";
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
  SiBluesky,
} from '@icons-pack/react-simple-icons'
import { Reorder, motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectSeparator, SelectGroup } from "@/components/ui/select"
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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"

const platformIcons: Record<string, any> = {
  // Social Media
  twitter: Twitter,
  bluesky: SiBluesky,
  threads: SiThreads,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitch: Twitch,
  discord: SiDiscord,
  tiktok: SiTiktok,
  kick: SiKick,
  github: Github,
  linkedin: Linkedin,

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
  bluesky: '#0085FF',
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

export interface SocialLink {
  id: string
  user_id: string
  platform: string
  url: string
  title: string
  order_index: number
  twitch_users?: {
    id: string
  }
}

interface SocialLinksManagerProps {
  initialLinks?: SocialLink[]
  twitchUserId: string
}

function AddLinkDialog({ userId, onAdd }: { 
  userId: string, 
  onAdd: () => void 
}) {
  const [platform, setPlatform] = useState("")
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: ['social-links', 'create'],
    mutationFn: async (data: {
      user_id: string
      platform: string
      url: string
      title: string
    }) => {
      const response = await fetch('/api/social-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links', userId] })
      onAdd()
      setPlatform("")
      setUrl("")
      setTitle("")
    },
    onError: (error) => {
      console.error('Error adding link:', error)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || userId === '') {
      console.error('Invalid user ID:', userId)
      return
    }

    mutation.mutate({
      user_id: userId,
      platform,
      url,
      title: title || platform
    })
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
              <SelectValue placeholder="Select Platform">
                {platform && (
                  <div className="flex items-center gap-2">
                    {React.createElement(platformIcons[platform], { 
                      className: "w-4 h-4",
                      style: { color: platformColors[platform] || 'currentColor' }
                    })}
                    <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {/* Social Media */}
              <SelectGroup>
                <SelectLabel>Social Media</SelectLabel>
                {[
                  'twitter',
                  'bluesky',
                  'threads',
                  'instagram',
                  'facebook',
                  'youtube',
                  'twitch',
                  'discord',
                  'tiktok',
                  'kick',
                  'github',
                  'linkedin'
                ].filter(platform => platformIcons[platform]).map((platform) => {
                  const Icon = platformIcons[platform];
                  const iconColor = platformColors[platform] || 'currentColor';
                  
                  return (
                    <SelectItem key={platform} value={platform}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: iconColor }} />
                        <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>

              <SelectSeparator />
              
              {/* Content Creation */}
              <SelectGroup>
                <SelectLabel>Content Creation</SelectLabel>
                {[
                  'streamelements',
                  'kofi',
                  'fourthwall',
                  'patreon',
                  'onlyfans'
                ].map((platform) => {
                  const Icon = platformIcons[platform];
                  const iconColor = platformColors[platform] || 'currentColor';
                  return (
                    <SelectItem key={platform} value={platform}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: iconColor }} />
                        <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>

              <SelectSeparator />

              {/* Payment/Support */}
              <SelectGroup>
                <SelectLabel>Payment & Support</SelectLabel>
                {[
                  'cashapp',
                  'venmo',
                  'paypal'
                ].map((platform) => {
                  const Icon = platformIcons[platform];
                  const iconColor = platformColors[platform] || 'currentColor';
                  return (
                    <SelectItem key={platform} value={platform}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: iconColor }} />
                        <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>

              <SelectSeparator />

              {/* Music/Audio */}
              <SelectGroup>
                <SelectLabel>Music & Audio</SelectLabel>
                {[
                  'spotify',
                  'soundcloud',
                  'bandcamp',
                  'music'
                ].map((platform) => {
                  const Icon = platformIcons[platform];
                  const iconColor = platformColors[platform] || 'currentColor';
                  return (
                    <SelectItem key={platform} value={platform}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: iconColor }} />
                        <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>

              <SelectSeparator />

              {/* Writing/Blogs */}
              <SelectGroup>
                <SelectLabel>Writing & Blogs</SelectLabel>
                {[
                  'substack',
                  'medium'
                ].map((platform) => {
                  const Icon = platformIcons[platform];
                  const iconColor = platformColors[platform] || 'currentColor';
                  return (
                    <SelectItem key={platform} value={platform}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: iconColor }} />
                        <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
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
              disabled={!platform || !url}
            >
              Add Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SocialLinksManager({ initialLinks = [], twitchUserId }: SocialLinksManagerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const queryClient = useQueryClient()

  const { data: links = initialLinks } = useQuery({
    queryKey: ['social-links', twitchUserId],
    queryFn: async () => {
      const response = await fetch(`/api/social-links?userId=${twitchUserId}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    initialData: initialLinks,
  })

  const setLinks = (newLinks: SocialLink[]) => {
    queryClient.setQueryData(['social-links', twitchUserId], newLinks)
  }

  const supabase = createClientComponentClient()

  useEffect(() => {
    console.log('Twitch User ID:', twitchUserId)
  }, [twitchUserId])

  useEffect(() => {
    if (!twitchUserId) return

    const channel = supabase
      .channel(`social_tree_${twitchUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_tree',
          filter: `user_id=eq.${twitchUserId}`
        },
        async () => {
          if (!isDragging) {
            const { data: freshLinks } = await supabase
              .from('social_tree')
              .select('*, twitch_users(*)')
              .eq('user_id', twitchUserId)
              .order('order_index', { ascending: true })

            if (freshLinks) setLinks(freshLinks)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, twitchUserId, isDragging])

  const reorderMutation = useMutation({
    mutationKey: ['social-links', 'reorder'],
    mutationFn: async (links: SocialLink[]) => {
      const response = await fetch('/api/social-links/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ links }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links', twitchUserId] });
    },
    onError: (error) => {
      console.error('Error reordering links:', error);
    }
  });

  const handleReorder = (newOrder: SocialLink[]) => {
    queryClient.setQueryData(['social-links', twitchUserId], newOrder);
    reorderMutation.mutate(newOrder);
  };

  const deleteMutation = useMutation({
    mutationKey: ['social-links', 'delete'],
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/social-links/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links', twitchUserId] })
    },
    onError: (error) => {
      console.error('Error deleting link:', error)
    }
  })

  const deleteLink = (id: string) => {
    setLinks((currentLinks) => currentLinks.filter(link => link.id !== id))
    deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-4">
      <AddLinkDialog 
        userId={twitchUserId}
        onAdd={() => {}}
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