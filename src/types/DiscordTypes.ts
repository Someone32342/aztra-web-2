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
  isRequiredEmailVerification: boolean;
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

export const Permissions: { [key: string]: bigint } = {
  CREATE_INSTANT_INVITE: 1n << 0n,
  KICK_MEMBERS: 1n << 1n,
  BAN_MEMBERS: 1n << 2n,
  ADMINISTRATOR: 1n << 3n,
  MANAGE_CHANNELS: 1n << 4n,
  MANAGE_GUILD: 1n << 5n,
  ADD_REACTIONS: 1n << 6n,
  VIEW_AUDIT_LOG: 1n << 7n,
  PRIORITY_SPEAKER: 1n << 8n,
  STREAM: 1n << 9n,
  VIEW_CHANNEL: 1n << 10n,
  SEND_MESSAGES: 1n << 11n,
  SEND_TTS_MESSAGES: 1n << 12n,
  MANAGE_MESSAGES: 1n << 13n,
  EMBED_LINKS: 1n << 14n,
  ATTACH_FILES: 1n << 15n,
  READ_MESSAGE_HISTORY: 1n << 16n,
  MENTION_EVERYONE: 1n << 17n,
  USE_EXTERNAL_EMOJIS: 1n << 18n,
  VIEW_GUILD_INSIGHTS: 1n << 19n,
  CONNECT: 1n << 20n,
  SPEAK: 1n << 21n,
  MUTE_MEMBERS: 1n << 22n,
  DEAFEN_MEMBERS: 1n << 23n,
  MOVE_MEMBERS: 1n << 24n,
  USE_VAD: 1n << 25n,
  CHANGE_NICKNAME: 1n << 26n,
  MANAGE_NICKNAMES: 1n << 27n,
  MANAGE_ROLES: 1n << 28n,
  MANAGE_WEBHOOKS: 1n << 29n,
  MANAGE_EMOJIS_AND_STICKERS: 1n << 3n,
  USE_APPLICATION_COMMANDS: 1n << 31n,
  REQUEST_TO_SPEAK: 1n << 32n,
  MANAGE_EVENTS: 1n << 33n,
  MANAGE_THREADS: 1n << 34n,
  CREATE_PUBLIC_THREADS: 1n << 35n,
  CREATE_PRIVATE_THREADS: 1n << 36n,
  USE_EXTERNAL_STICKERS: 1n << 37n,
  SEND_MESSAGES_IN_THREADS: 1n << 38n,
  START_EMBEDDED_ACTIVITIES: 1n << 39n,
  MODERATE_MEMBERS: 1n << 40n,
};
