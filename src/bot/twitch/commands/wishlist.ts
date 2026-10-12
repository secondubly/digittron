import { command } from '../services/permissions'

export default command('wishlist', 'everyone', async (_params, ctx) => {
  ctx.say('throne: https://throne.com/secondubly | steam: https://store.steampowered.com/wishlist/id/secondubly',)
})
