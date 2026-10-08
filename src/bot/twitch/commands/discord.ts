import { command } from '../services/permissions'

export default command('discord', 'everyone', async (_params, ctx) => {
  ctx.say(`join the discord here: ${process.env.DISCORD_URL ?? 'http://discord.gg/6EtUH9X'}`)
})
