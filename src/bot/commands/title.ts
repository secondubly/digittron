import type { Command, CommandContext } from '../types.js'

const title: Command = {
  name: 'title',
  aliases: [],
  description: 'Show stream title (for viwers) or change stream title (for moderators and up)',
  async execute({ msg, args, client, say }: CommandContext) {
    const { broadcasterId, chatterId, chatterDisplayName } = msg
    const channelInfo = await client.channels.getChannelInfoById(broadcasterId)
    if (!channelInfo) {
      return
    }

    if (!args.length) {
      say(`@${chatterDisplayName}, title: ${channelInfo.title}`)
    } else {
      const isMod = await client.moderation.checkUserMod(broadcasterId, chatterId)
      const isBroadcaster = chatterId === process.env.TWITCH_ID
      if (!isMod && !isBroadcaster) {
        return
      }

      const streamTitle = args.join(' ')

      client.channels.updateChannelInfo(broadcasterId, {
        title: streamTitle,
      })

      say(`@${msg.chatterDisplayName} updated game title to: ${streamTitle}.`)
    }
  },
}

export default title
