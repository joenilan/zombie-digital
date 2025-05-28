import { Icon } from '@iconify/react'
import React from 'react'

// Icon component wrapper for consistent styling
interface IconProps {
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
}

// Generic icon wrapper
export function IconifyIcon({ icon, className, style, onClick }: IconProps & { icon: string }) {
    return (
        <Icon
            icon={icon}
            className={className}
            style={style}
            onClick={onClick}
        />
    )
}

// UI Icons (from Lucide collection)
export const Twitter = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:twitter" className={className} style={style} onClick={onClick} />

export const Youtube = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:youtube" className={className} style={style} onClick={onClick} />

export const Twitch = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:twitch" className={className} style={style} onClick={onClick} />

export const Instagram = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:instagram" className={className} style={style} onClick={onClick} />

export const Facebook = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:facebook" className={className} style={style} onClick={onClick} />

export const Github = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:github" className={className} style={style} onClick={onClick} />

export const Linkedin = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:linkedin" className={className} style={style} onClick={onClick} />

export const Globe = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:globe" className={className} style={style} onClick={onClick} />

export const Link = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:link" className={className} style={style} onClick={onClick} />

export const Copy = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:copy" className={className} style={style} onClick={onClick} />

export const ExternalLink = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:external-link" className={className} style={style} onClick={onClick} />

export const Eye = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:eye" className={className} style={style} onClick={onClick} />

export const EyeOff = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:eye-off" className={className} style={style} onClick={onClick} />

export const Search = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:search" className={className} style={style} onClick={onClick} />

export const SortAsc = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:sort-asc" className={className} style={style} onClick={onClick} />

export const SortDesc = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:sort-desc" className={className} style={style} onClick={onClick} />

export const Upload = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:upload" className={className} style={style} onClick={onClick} />

export const Loader2 = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:loader-2" className={className} style={style} onClick={onClick} />

export const X = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:x" className={className} style={style} onClick={onClick} />

export const ImageIcon = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:image" className={className} style={style} onClick={onClick} />

export const QrCode = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:qr-code" className={className} style={style} onClick={onClick} />

export const BarChart4 = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:bar-chart-4" className={className} style={style} onClick={onClick} />

export const Share2 = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:share-2" className={className} style={style} onClick={onClick} />

export const Settings = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:settings" className={className} style={style} onClick={onClick} />

export const Layers = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:layers" className={className} style={style} onClick={onClick} />

export const ChevronRight = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:chevron-right" className={className} style={style} onClick={onClick} />

export const ChevronLeft = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:chevron-left" className={className} style={style} onClick={onClick} />

export const ChevronDown = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:chevron-down" className={className} style={style} onClick={onClick} />

export const UserCircle = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:user-circle" className={className} style={style} onClick={onClick} />

export const Calendar = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:calendar" className={className} style={style} onClick={onClick} />

export const ArrowUpRight = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:arrow-up-right" className={className} style={style} onClick={onClick} />

export const RefreshCcw = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:refresh-ccw" className={className} style={style} onClick={onClick} />

export const Rocket = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:rocket" className={className} style={style} onClick={onClick} />

export const Music = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:music" className={className} style={style} onClick={onClick} />

export const Store = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:store" className={className} style={style} onClick={onClick} />

export const DollarSign = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:dollar-sign" className={className} style={style} onClick={onClick} />

export const MoreHorizontal = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:more-horizontal" className={className} style={style} onClick={onClick} />

// Brand Icons (from Simple Icons collection - monochrome by default)
export const Discord = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:discord" className={className} style={style} onClick={onClick} />

export const Tiktok = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:tiktok" className={className} style={style} onClick={onClick} />

export const Kick = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:kick" className={className} style={style} onClick={onClick} />

export const Kofi = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:kofi" className={className} style={style} onClick={onClick} />

export const Patreon = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:patreon" className={className} style={style} onClick={onClick} />

export const Onlyfans = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:onlyfans" className={className} style={style} onClick={onClick} />

export const Cashapp = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:cashapp" className={className} style={style} onClick={onClick} />

export const Venmo = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:venmo" className={className} style={style} onClick={onClick} />

export const Paypal = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:paypal" className={className} style={style} onClick={onClick} />

export const Spotify = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:spotify" className={className} style={style} onClick={onClick} />

export const Soundcloud = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:soundcloud" className={className} style={style} onClick={onClick} />

export const Bandcamp = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:bandcamp" className={className} style={style} onClick={onClick} />

export const Threads = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:threads" className={className} style={style} onClick={onClick} />

export const Substack = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:substack" className={className} style={style} onClick={onClick} />

export const Medium = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:medium" className={className} style={style} onClick={onClick} />

export const Bluesky = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:bluesky" className={className} style={style} onClick={onClick} />

// Additional missing icons
export const Snapchat = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:snapchat" className={className} style={style} onClick={onClick} />

export const Pinterest = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:pinterest" className={className} style={style} onClick={onClick} />

export const Reddit = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:reddit" className={className} style={style} onClick={onClick} />

export const Tumblr = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:tumblr" className={className} style={style} onClick={onClick} />

export const Vimeo = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:vimeo" className={className} style={style} onClick={onClick} />

export const Dailymotion = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:dailymotion" className={className} style={style} onClick={onClick} />

export const Amazon = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:amazon" className={className} style={style} onClick={onClick} />

export const Etsy = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:etsy" className={className} style={style} onClick={onClick} />

export const Shopify = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:shopify" className={className} style={style} onClick={onClick} />

export const Applemusic = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:applemusic" className={className} style={style} onClick={onClick} />

export const Fansly = ({ className, style, onClick }: IconProps) =>
    <Icon icon="simple-icons:fansly" className={className} style={style} onClick={onClick} />

export const Manyvids = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:external-link" className={className} style={style} onClick={onClick} />

export const Fourthwall = ({ className, style, onClick }: IconProps) =>
    <Icon icon="lucide:external-link" className={className} style={style} onClick={onClick} />

// Platform icon mapping for dynamic usage
export const platformIcons: Record<string, React.ComponentType<IconProps>> = {
    // Social Media
    twitter: Twitter,
    bluesky: Bluesky,
    youtube: Youtube,
    twitch: Twitch,
    instagram: Instagram,
    facebook: Facebook,
    github: Github,
    linkedin: Linkedin,
    discord: Discord,
    tiktok: Tiktok,
    kick: Kick,
    threads: Threads,
    snapchat: Snapchat,
    pinterest: Pinterest,
    reddit: Reddit,
    tumblr: Tumblr,

    // Content Creation
    kofi: Kofi,
    patreon: Patreon,
    onlyfans: Onlyfans,
    fansly: Fansly,
    manyvids: Manyvids,

    // Payment/Support
    cashapp: Cashapp,
    venmo: Venmo,
    paypal: Paypal,
    fourthwall: Fourthwall,

    // Music/Audio
    spotify: Spotify,
    soundcloud: Soundcloud,
    bandcamp: Bandcamp,
    applemusic: Applemusic,
    music: Music,

    // Video/Media
    vimeo: Vimeo,
    dailymotion: Dailymotion,

    // Writing/Blogs
    substack: Substack,
    medium: Medium,

    // E-commerce
    amazon: Amazon,
    etsy: Etsy,
    shopify: Shopify,

    // Generic
    website: Globe,
    link: Link,
}

// Helper function to get platform icon
export function getPlatformIcon(platform: string): React.ComponentType<IconProps> {
    const normalizedPlatform = platform.toLowerCase().trim()
    return platformIcons[normalizedPlatform] || Link
}

// Platform colors (optional - for when you want colored icons)
export const platformColors: Record<string, string> = {
    twitter: '#1DA1F2',
    bluesky: '#0085FF',
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
    github: '#333333',
    linkedin: '#0077B5',
    facebook: '#1877F2',
    cashapp: '#00D632',
    venmo: '#3D95CE',
    paypal: '#0070BA',
    soundcloud: '#FF5500',
    bandcamp: '#629AA0',
    substack: '#FF6719',
    medium: '#000000',
    threads: '#000000',
    snapchat: '#FFFC00',
    pinterest: '#BD081C',
    reddit: '#FF4500',
    tumblr: '#36465D',
    vimeo: '#1AB7EA',
    dailymotion: '#0066DC',
    amazon: '#FF9900',
    etsy: '#F45800',
    shopify: '#7AB55C',
    applemusic: '#FA243C',
    fansly: '#0085FF',
    manyvids: '#FF69B4',
    fourthwall: '#FF69B4',
    website: '#6B7280',
    link: '#6B7280',
}

export function getPlatformColor(platform: string): string {
    const normalizedPlatform = platform.toLowerCase().trim()
    return platformColors[normalizedPlatform] || '#6B7280'
}

// Platform URL patterns for generating links
export const platformUrlPatterns: Record<string, string> = {
    twitter: "twitter.com/",
    bluesky: "bsky.app/profile/",
    threads: "threads.net/@",
    instagram: "instagram.com/",
    facebook: "facebook.com/",
    youtube: "youtube.com/@",
    twitch: "twitch.tv/",
    discord: "discord.gg/",
    tiktok: "tiktok.com/@",
    kick: "kick.com/",
    github: "github.com/",
    linkedin: "linkedin.com/in/",
    onlyfans: "onlyfans.com/",
    fansly: "fansly.com/",
    manyvids: "manyvids.com/Profile/",
    patreon: "patreon.com/",
    kofi: "ko-fi.com/",
    substack: ".substack.com",
    medium: "medium.com/@",
    spotify: "open.spotify.com/user/",
    soundcloud: "soundcloud.com/",
    applemusic: "music.apple.com/profile/",
    snapchat: "snapchat.com/add/",
    pinterest: "pinterest.com/",
    reddit: "reddit.com/user/",
    tumblr: ".tumblr.com",
    vimeo: "vimeo.com/",
    dailymotion: "dailymotion.com/",
    amazon: "amazon.com/shop/",
    etsy: "etsy.com/shop/",
    shopify: ".myshopify.com",
    paypal: "paypal.me/",
    cashapp: "cash.app/$",
    venmo: "venmo.com/",
    fourthwall: "fourthwall.com/",
}

export const getPlatformUrl = (platform: string, username: string): string => {
    const pattern = platformUrlPatterns[platform];
    if (!pattern) return username; // If no pattern, return username as-is

    // Special case for Fourthwall - allow full domain input
    if (platform === "fourthwall") {
        // If it already includes a protocol or domain, use it as is
        if (username.includes(".") || username.includes("://")) {
            if (username.startsWith("http")) {
                return username;
            }
            return `https://${username}`;
        }
        // Use the Fourthwall shop URL format
        return `https://${username}-shop.fourthwall.com/`;
    }

    // Special cases for platforms that need different URL construction
    if (
        platform === "substack" ||
        platform === "tumblr" ||
        platform === "shopify"
    ) {
        return `https://${username}${pattern}`;
    }

    return `https://${pattern}${username}`;
} 