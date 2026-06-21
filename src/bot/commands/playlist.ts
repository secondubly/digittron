import type { Command, CommandContext } from '../types.js'

const playlist: Command = {
  name: 'playlist',
  aliases: [],
  description: 'Get the streamer’s playlist',
  async execute({ msg, say }: CommandContext) {
    const { chatterDisplayName } = msg
    say(
      `@${chatterDisplayName} starting soon playlist: https://open.spotify.com/playlist/666mjTAcb7PYiWEnincpNt?si=54d75be2632741ac`,
    )
  },
}

export default playlist
