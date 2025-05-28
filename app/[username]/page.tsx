'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { notFound } from 'next/navigation'
import { OwnershipChecker } from './ownership-checker'
import { ProfileContent } from './profile-content'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface PageProps {
  params: {
    username: string
  }
  searchParams: {
    transparent?: string
  }
}

interface Profile {
  user_id: string
  username: string
  display_name: string
  profile_image_url: string
  description?: string
  created_at: string
  background_media_url: string | null
  background_media_type: string | null
  twitch_id: string
}

interface SocialLink {
  id: string
  user_id: string
  platform: string
  url: string
  title?: string
  order_index: number
  created_at?: string
  updated_at?: string
}

export default function ProfilePage({ params, searchParams }: PageProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [initialLinks, setInitialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()
  const { username } = params
  const isTransparent = searchParams.transparent === 'true'

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true)
        setError(null)

        // Get user data from public_profiles view (no auth needed)
        const { data: profileData, error: profileError } = await supabase
          .from('public_profiles')
          .select(`
            user_id,
            username,
            display_name,
            profile_image_url,
            description,
            created_at,
            background_media_url,
            background_media_type,
            twitch_id
          `)
          .eq('username', username)
          .single()

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profile not found
            setError('Profile not found')
            return
          }
          throw profileError
        }

        if (!profileData) {
          setError('Profile not found')
          return
        }

        setProfile(profileData)

        // Get public social links (no auth needed)
        const { data: linksData, error: linksError } = await supabase
          .from('social_tree')
          .select('*')
          .eq('user_id', profileData.user_id)
          .order('order_index', { ascending: true })

        if (linksError) {
          console.error('Error fetching links:', linksError)
          // Don't fail the whole page if links fail to load
          setInitialLinks([])
        } else {
          setInitialLinks(linksData || [])
        }
      } catch (err) {
        console.error('Error fetching profile data:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfileData()
    }
  }, [username, supabase])

  if (loading) {
    return (
      <div className={`min-h-screen py-12 px-4 ${isTransparent ? 'bg-transparent' : ''}`}>
        <div className="max-w-2xl mx-auto flex items-center justify-center py-16">
          <LoadingSpinner text="Loading profile..." />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen py-12 px-4 ${isTransparent ? 'bg-transparent' : ''}`}>
        <div className="max-w-2xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">
            {error || 'The profile you are looking for does not exist.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen py-12 px-4 ${isTransparent ? 'bg-transparent' : ''}`}>
      {/* Client-side ownership checker and conditional rendering */}
      <OwnershipChecker username={username}>
        {(isOwner) => (
          <ProfileContent
            profile={profile}
            initialLinks={initialLinks}
            isTransparent={isTransparent}
            isOwner={isOwner}
          />
        )}
      </OwnershipChecker>
    </div>
  )
}
