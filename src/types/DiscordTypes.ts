type ClientPresenceStatus = 'online' | 'idle' | 'dnd';

export interface PartialGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: string;
  permissions: string;
}

export interface PartialGuildExtend extends PartialGuild {
  bot_joined: boolean;
}

export interface PartialInviteGuild {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  presenceCount: number;
}

export interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface Role {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
}

export interface Member {
  user?: User;
  nick: string | null;
  roles: string[];
  joined_at: string;
  premium_since?: string;
  deaf: boolean;
  mute: boolean;
}

export interface Overwrite {
  id: string;
  type: number;
  allow: string;
  deny: string;
}

export enum ChannelTypes {
  GUILD_TEXT,
  DM,
  GUILD_VOICE,
  GROUP_DM,
  GUILD_CATEGORY,
  GUILD_NEWS,
  GUILD_STORE,
}

export interface Channel {
  id: string;
  type: number;
  guild_id?: string;
  position?: number;
  permissions_overwrites?: Overwrite[];
  name?: string;
  topic?: string | null;
  nsfw?: boolean;
  last_message_id?: string | null;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: User[];
  icon?: string | null;
  owner_id?: string;
  application_id?: string;
  parent_id?: string | null;
  last_pin_timestamp?: string | null;
}

export interface EmojiExtended {
  animated: boolean | null;
  createdAt: number | null;
  id: string | null;
  identifier: string;
  name: string | null;
  url: string | null;
}

export type EmojiExtendedFulltimed = Omit<EmojiExtended, 'createdAt'> & {
  createdAt: Date | null;
};

export interface ActivityExtended {
  createdAt: number;
  details: string | null;
  emoji: EmojiExtended | null;
  name: string;
  state: string | null;
  timestamps: {
    start: number | null;
    end: number | null;
  } | null;
  type: string;
  url: string | null;
}

export type ActivityExtendedFulltimed = Omit<
  ActivityExtended,
  'createdAt' | 'timestamps' | 'emoji'
> & {
  createdAt: Date;
  emoji: EmojiExtendedFulltimed | null;
  timestamps: {
    start: Date | null;
    end: Date | null;
  } | null;
};

export interface PresenceExtended {
  activities: ActivityExtended[];
  clientStatus: {
    web: ClientPresenceStatus | null;
    mobile: ClientPresenceStatus | null;
    desktop: ClientPresenceStatus | null;
  } | null;
  status: string;
}

export type PresenceExtendedFulltimed = Omit<PresenceExtended, 'activities'> & {
  activities: ActivityExtendedFulltimed[];
};

export interface UserMinimal {
  avatar: string | null;
  bot: boolean;
  createdAt: number;
  defaultAvatarURL: string;
  discriminator: string | null;
  id: string;

  system: boolean | null;
  tag: string | null;
  username: string | null;
}

export interface UserExtended extends UserMinimal {
  presence: PresenceExtended | null;
}

export type UserExtendedFulltimed = Omit<
  UserExtended,
  'createdAt' | 'presence'
> & {
  createdAt: Date;
  presence: PresenceExtendedFulltimed | null;
};

export interface MemberMinimal {
  displayColor: number;
  displayName: string | null;
  joinedAt: number | null;
  nickname: string | null;
  permissions: number;
  premiumSince: number | null;
  roles: string[];

  user: UserMinimal;
}

export interface MemberExtended extends MemberMinimal {
  bannable: boolean;

  kickable: boolean;
  manageable: boolean;

  highestRole: string;
  hoistRole: string | null;

  user: UserExtended;
}

export type MemberExtendedFulltimed = Omit<
  MemberExtended,
  'joinedAt' | 'premiumSince' | 'user'
> & {
  joinedAt: Date | null;
  premiumSince: Date | null;
  user: UserExtendedFulltimed;
};

export interface ChannelMinimal {
  createdTimestamp: number;
  id: string;
  manageable: boolean;
  name: string;
  parentId: string | null;
  position?: number;
  rawPosition?: number;
  type:
    | 'GUILD_TEXT'
    | 'DM'
    | 'GUILD_VOICE'
    | 'GROUP_DM'
    | 'GUILD_CATEGORY'
    | 'GUILD_NEWS'
    | 'GUILD_STORE'
    | 'GUILD_NEWS_THREAD'
    | 'GUILD_PUBLIC_THREAD'
    | 'GUILD_PRIVATE_THREAD'
    | 'GUILD_STAGE_VOICE'
    | 'UNKNOWN';
  viewable?: boolean;
}

export const Permissions: { [key: string]: number } = {
  CREATE_INSTANT_INVITE: 0x1,
  KICK_MEMBERS: 0x2,
  BAN_MEMBERS: 0x4,
  ADMINISTRATOR: 0x8,
  MANAGE_CHANNELS: 0x10,
  MANAGE_GUILD: 0x20,
  ADD_REACTIONS: 0x40,
  VIEW_AUDIT_LOG: 0x80,
  PRIORITY_SPEAKER: 0x100,
  STREAM: 0x200,
  VIEW_CHANNEL: 0x400,
  SEND_MESSAGES: 0x800,
  SEND_TTS_MESSAGES: 0x1000,
  MANAGE_MESSAGES: 0x2000,
  EMBED_LINKS: 0x4000,
  ATTACH_FILES: 0x8000,
  READ_MESSAGE_HISTORY: 0x10000,
  MENTION_EVERYONE: 0x20000,
  USE_EXTERNAL_EMOJIS: 0x40000,
  VIEW_GUILD_INSIGHTS: 0x80000,
  CONNECT: 0x100000,
  SPEAK: 0x200000,
  MUTE_MEMBERS: 0x400000,
  DEAFEN_MEMBERS: 0x800000,
  MOVE_MEMBERS: 0x1000000,
  USE_VAD: 0x2000000,
  CHANGE_NICKNAME: 0x4000000,
  MANAGE_NICKNAMES: 0x80000007,
  MANAGE_ROLES: 0x10000000,
  MANAGE_WEBHOOKS: 0x20000000,
  MANAGE_EMOJIS_AND_STICKERS: 0x40000000,
  USE_SLASH_COMMANDS: 0x80000000,
  REQUEST_TO_SPEAK: 0x100000000,
  MANAGE_THREADS: 0x200000000,
  USE_PUBLIC_THREADS: 0x400000000,
  USE_PRIVATE_THREADS: 0x800000000,
  USE_EXTERNAL_STICKERS: 0x1000000000,
};
