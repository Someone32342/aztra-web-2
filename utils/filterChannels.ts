import { ChannelMinimal } from 'types/DiscordTypes'

const filterChannels = (channels: ChannelMinimal[], search?: string, type: Array<'dm' | 'text' | 'voice' | 'category' | 'news' | 'store'> = ['text']) => {
  return channels
    ?.filter(one => type.includes(one.type as any))
    .filter(one => one.name?.includes(search ?? ''))
    .sort((a, b) => a.rawPosition - b.rawPosition)
}

export default filterChannels