"use client"

import Image from "next/image"
import type { TwitchUser } from "@/types/database"

interface StreamInfoProps {
  user: TwitchUser
}

export function StreamInfo({ user }: StreamInfoProps) {
  // Only render if we have game, title, or tags to show
  if (!user.current_game && !user.stream_title && (!user.tags || user.tags.length === 0)) {
    return null;
  }

  return (
    <div className="bg-glass rounded-xl shadow-glass p-6">
      <div className="flex gap-4">
        {user.current_game && (
          <Image
            src={user.current_game.box_art_url}
            alt={user.current_game.name}
            width={100}
            height={133}
            className="rounded-lg"
            sizes="100px"
          />
        )}
        <div className="flex-1">
          {user.stream_title && (
            <h3 className="text-xl font-semibold mb-2">
              {user.stream_title}
            </h3>
          )}
          {user.current_game && (
            <p className="text-muted-foreground mb-4">
              Playing {user.current_game.name}
            </p>
          )}
          {user.tags && user.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-background/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 