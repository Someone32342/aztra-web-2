import { ChannelMinimal } from 'types/DiscordTypes'

const filterChannels = (channels: ChannelMinimal[], search?: string) => {
  return channels
    ?.filter(one => one.type === "text")
    .filter(one => one.name?.includes(search ?? ''))
    .sort((a, b) => a.rawPosition - b.rawPosition)
}

export default filterChannels