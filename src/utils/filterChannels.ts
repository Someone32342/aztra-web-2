import { ChannelMinimal } from 'types/DiscordTypes';

const filterChannels = (
  channels: ChannelMinimal[],
  search?: string,
  type: Array<ChannelMinimal['type']> = ['GUILD_TEXT']
) => {
  return channels
    ?.filter((one) => type.includes(one.type as any))
    .filter((one) => one.name?.includes(search ?? ''))
    .sort((a, b) => (a.rawPosition ?? 0) - (b.rawPosition ?? 0));
};

export default filterChannels;
