import type { Command, CommandContext } from '../types.js'

const wishlist: Command = {
  name: 'wishlist',
  aliases: [],
  description: 'Stream wishlist links',
  async execute({ say }: CommandContext) {
    say(
      'throne: https://throne.com/secondubly | steam: https://store.steampowered.com/wishlist/id/secondubly',
    )
  },
}

export default wishlist
