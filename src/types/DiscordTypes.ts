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
  CREATE_INSTANT_INVITE: 1 << 0,
  KICK_MEMBERS: 1 << 1,
  BAN_MEMBERS: 1 << 2,
  ADMINISTRATOR: 1 << 3,
  MANAGE_CHANNELS: 1 << 4,
  MANAGE_GUILD: 1 << 5,
  ADD_REACTIONS: 1 << 6,
  VIEW_AUDIT_LOG: 1 << 7,
  PRIORITY_SPEAKER: 1 << 8,
  STREAM: 1 << 9,
  VIEW_CHANNEL: 1 << 10,
  SEND_MESSAGES: 1 << 11,
  SEND_TTS_MESSAGES: 1 << 12,
  MANAGE_MESSAGES: 1 << 13,
  EMBED_LINKS: 1 << 14,
  ATTACH_FILES: 1 << 15,
  READ_MESSAGE_HISTORY: 1 << 16,
  MENTION_EVERYONE: 1 << 17,
  USE_EXTERNAL_EMOJIS: 1 << 18,
  VIEW_GUILD_INSIGHTS: 1 << 19,
  CONNECT: 1 << 20,
  SPEAK: 1 << 21,
  MUTE_MEMBERS: 1 << 22,
  DEAFEN_MEMBERS: 1 << 23,
  MOVE_MEMBERS: 1 << 24,
  USE_VAD: 1 << 25,
  CHANGE_NICKNAME: 1 << 26,
  MANAGE_NICKNAMES: 1 << 27,
  MANAGE_ROLES: 1 << 28,
  MANAGE_WEBHOOKS: 1 << 29,
  MANAGE_EMOJIS_AND_STICKERS: 1 << 30,
  USE_APPLICATION_COMMANDS: 1 << 31,
  REQUEST_TO_SPEAK: 1 << 32,
  MANAGE_EVENTS: 1 << 33,
  MANAGE_THREADS: 1 << 34,
  CREATE_PUBLIC_THREADS: 1 << 35,
  CREATE_PRIVATE_THREADS: 1 << 36,
  USE_EXTERNAL_STICKERS: 1 << 37,
  SEND_MESSAGES_IN_THREADS: 1 << 38,
  START_EMBEDDED_ACTIVITIES: 1 << 39,
  MODERATE_MEMBERS: 1 << 40,
};
