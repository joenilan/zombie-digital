"use client"

import Image from "next/image"
import type { TwitchUser } from "@/types/database"

interface UserHeaderProps {
  user: TwitchUser
}

export function UserHeader({ user }: UserHeaderProps) {
  return (
    <div className="bg-glass rounded-xl shadow-glass p-6 transition-all duration-300 hover:shadow-cyber">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="live-ring"></div>
          <Image
            src={user.profile_image_url}
            alt={user.display_name}
            width={80}
            height={80}
            className="rounded-full relative z-10"
            priority
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-purple-500/20 z-20"></div>
          {user.stream_live && (
            <div className="live-badge z-30">
              <div className="live-dot"></div>
              LIVE
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">{user.display_name}</h2>
            {user.site_role && (
              <span className="
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm
              ">
                {user.site_role}
              </span>
            )}
            {user.twitch_role && (
              <span className="
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm
              ">
                {user.twitch_role}
              </span>
            )}
          </div>
          <a 
            href={`/${user.username}`}
            className="text-foreground/60 hover:text-foreground transition-colors relative z-10"
          >
            @{user.username}
          </a>
        </div>
      </div>
    </div>
  )
} 