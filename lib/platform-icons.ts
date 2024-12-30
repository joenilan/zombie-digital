import {
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Twitch,
  Github,
  Linkedin,
  MessageSquare,
  ExternalLink,
  LucideIcon,
} from "lucide-react";
import {
  SiTiktok,
  SiKick,
  SiBluesky,
  SiThreads,
  SiOnlyfans,
  SiPatreon,
  SiKofi,
  SiSubstack,
  SiMedium,
  SiSpotify,
  SiSoundcloud,
  SiApplemusic,
  SiSnapchat,
  SiPinterest,
  SiReddit,
  SiTumblr,
  SiVimeo,
  SiDailymotion,
  SiTwitch,
  SiAmazon,
  SiEtsy,
  SiShopify,
  SiPaypal,
  SiCashapp,
  SiVenmo,
} from "@icons-pack/react-simple-icons";

export const platformUrlPatterns: { [key: string]: string } = {
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
};

export const platformIcons: { [key: string]: LucideIcon | any } = {
  twitter: Twitter,
  bluesky: SiBluesky,
  threads: SiThreads,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitch: SiTwitch,
  discord: MessageSquare,
  tiktok: SiTiktok,
  kick: SiKick,
  github: Github,
  linkedin: Linkedin,
  onlyfans: SiOnlyfans,
  fansly: ExternalLink,
  manyvids: ExternalLink,
  patreon: SiPatreon,
  kofi: SiKofi,
  substack: SiSubstack,
  medium: SiMedium,
  spotify: SiSpotify,
  soundcloud: SiSoundcloud,
  applemusic: SiApplemusic,
  snapchat: SiSnapchat,
  pinterest: SiPinterest,
  reddit: SiReddit,
  tumblr: SiTumblr,
  vimeo: SiVimeo,
  dailymotion: SiDailymotion,
  amazon: SiAmazon,
  etsy: SiEtsy,
  shopify: SiShopify,
  paypal: SiPaypal,
  cashapp: SiCashapp,
  venmo: SiVenmo,
  fourthwall: ExternalLink,
  other: ExternalLink,
};

export const platformColors: { [key: string]: string } = {
  twitter: "#1DA1F2",
  bluesky: "#0085FF",
  threads: "#000000",
  instagram: "#E4405F",
  facebook: "#1877F2",
  youtube: "#FF0000",
  twitch: "#9146FF",
  discord: "#5865F2",
  tiktok: "#000000",
  kick: "#53FC18",
  github: "#181717",
  linkedin: "#0A66C2",
  onlyfans: "#00AFF0",
  fansly: "#0085FF",
  manyvids: "#FF69B4",
  patreon: "#FF424D",
  kofi: "#FF5E5B",
  substack: "#FF6719",
  medium: "#000000",
  spotify: "#1DB954",
  soundcloud: "#FF3300",
  applemusic: "#FA243C",
  snapchat: "#FFFC00",
  pinterest: "#BD081C",
  reddit: "#FF4500",
  tumblr: "#36465D",
  vimeo: "#1AB7EA",
  dailymotion: "#0066DC",
  amazon: "#FF9900",
  etsy: "#F45800",
  shopify: "#7AB55C",
  paypal: "#00457C",
  cashapp: "#00D632",
  venmo: "#3D95CE",
  fourthwall: "#FF69B4",
};

export const getPlatformIcon = (platform: string) => {
  return platformIcons[platform] || platformIcons.other;
};

export const getPlatformColor = (platform: string) => {
  return platformColors[platform] || "currentColor";
};

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
};
