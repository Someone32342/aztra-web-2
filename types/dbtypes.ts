export interface Exp {
  id: string
  exp: number
}

export interface Greetings {
  guild: string
  channel?: string
  join_title_format?: string | null
  join_desc_format?: string | null
  leave_title_format?: string | null
  leave_desc_format?: string | null
}

export interface ServerData {
  noticeChannel: string
  sendLevelMessage: boolean
}

export interface Warns {
  uuid: string
  guild: string
  member: string
  count: number
  warnby: string
  reason: string
  dt: string
}

export interface LoggingSet {
  channel: string
  flags: string
}

export interface Billboard {
  uuid: string
  guild: string
  channel: string
  value: string
}

export interface MemberCount {
  uuid: string
  guild: string
  dt: string
  count: number
}

export interface MsgCount {
  uuid: string
  guild: string
  dt: string
  count_user: number
  count_bot: number
}