import type { Command, CommandContext } from '../types.js'

const wishlist: Command = {
  name: 'wishlist',
  aliases: [],
  description: 'Stream wishlist links',
  enabled: true,
  async execute({ say }: CommandContext) {
    say(
      'throne: https://throne.com/secondubly | steam: https://store.steampowered.com/wishlist/id/secondubly',
    )
  },
}

export default wishlist
