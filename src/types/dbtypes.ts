export interface Exp {
  id: string;
  exp: number;
}

export interface Greetings {
  guild: string;
  channel?: string;
  join_title_format?: string | null;
  join_desc_format?: string | null;
  leave_title_format?: string | null;
  leave_desc_format?: string | null;
}

export interface ServerData {
  noticeChannel: string | null;
  sendLevelMessage: boolean;
  prefix: string;
}

export interface LevelingSet {
  guild: string;
  channel: string | null | false;
  format: string;
  except_command: boolean;
  except_attachments: boolean;
}

export interface Warns {
  uuid: string;
  guild: string;
  member: string;
  count: number;
  warnby: string;
  reason: string;
  dt: string;
}

export interface LoggingSet {
  channel: string;
  flags: string;
}

export interface Billboard {
  uuid: string;
  guild: string;
  channel: string;
  value: string;
}

export interface MemberCount {
  uuid: string;
  guild: string;
  dt: string;
  count: number;
}

export interface MsgCount {
  uuid: string;
  guild: string;
  dt: string;
  count_user: number;
  count_bot: number;
}

export interface TicketSetPOST {
  guild: string;
  name: string;
  channel: string;
  emoji: string;
  category: string | null;
  access_roles: string[];
  mention_roles: boolean;
}

export interface TicketPerms {
  type: 'role' | 'member' | 'opener';
  id?: string;
  allow: number;
  deny: number;
  mention?: boolean;
  ext_allow?: number;
}

export interface TicketSet {
  uuid: string;
  guild: string;
  name: string;
  channel: string;
  emoji: string;
  category_opened: string | null;
  category_closed: string | null;
  message: string;

  perms_open: TicketPerms[];
  perms_closed: TicketPerms[];

  ticket_number: number;

  create_message: string;
  initial_message: string;

  channel_name_open: string;
  channel_name_closed: string;

  deleted: boolean;
}

export interface Ticket {
  uuid: string;
  setuuid: string;
  channel: string;
  opener: string;
  number: number;
  status: 'open' | 'closed' | 'deleted';
  initial_message: string;
  closed_message: string | null;
  created_at: string;
}

export interface TranscriptMinimal {
  uuid: string;
  ticketid: string;
  created_at: string;
}

export interface Transcript extends TranscriptMinimal {
  html: string;
}

export interface SecureInvite {
  id: string;
  guild: string;
  created_at: string;
  max_age: number;
  uses: number;
  max_uses: number;
}
