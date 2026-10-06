export type Part = string | { src: string; alt: string }

export type Msg = {
  id: string
  userId: string
  name: string
  color: string
  action: boolean
  parts: Part[]
  at: number
}

// 7TV types
export interface SevenTVEmoteSetResponse {
  id: string;
  name: string;
  flags: number;
  tags: string[];
  immutable: boolean;
  privileged: boolean;
  emotes: SevenTVEmote[];
  emote_count: number;
  capacity: number;
  owner: SevenTVUser;
}

export interface SevenTVUserResponse {
  id: string;
  username: string;
  display_name: string;
  roles: string[];
  emote_set: SevenTVEmoteSetResponse;
  user_connections: {
    id: string;
    platform: 'TWITCH' | 'YOUTUBE' | 'KICK' | 'DISCORD';
    username: string;
    display_name: string;
    linked_at: number;
  }[];
}

export interface SevenTVEmote {
  id: string;
  name: string;
  flags: number;
  lifecycle: number;
  tags?: string[];
  animated: boolean;
  owner?: SevenTVUser;
  host: SevenTVHost;
}

export interface SevenTVUser {
  id: string;
  username: string;
  display_name: string;
  roles: string[];
}

export interface SevenTVHost {
  url: string; // The base URL for the CDN (e.g., "//cdn.7tv.app/emote/xxxx")
  files: SevenTVFile[];
}

export interface SevenTVFile {
  name: string; // File name (e.g., "1x.webp")
  static_name: string;
  width: number;
  height: number;
  frame_count: number;
  size: number;
  format: 'WEBP' | 'AVIF';
}

// BTTV Types
export interface BTTVEmote {
  id: string;
  code: string; // The actual text trigger (e.g., "OMEGALUL")
  imageType: 'png' | 'gif' | 'webp';
  animated: boolean;
  userId?: string; // Present on shared emotes
  modifier?: boolean
  user?: {
    id: string;
    name: string;
    displayName: string;
  };
}

export interface BTTVUserResponse {
  id: string;
  bots: string[];
  avatar: string;
  channelEmotes: BTTVEmote[];
  sharedEmotes: BTTVEmote[];
}