import { command } from '../services/permissions'

export default command('blind', 'everyone', async (_params, ctx) => {
  ctx.say(
    `This is a first time playthrough, please do not backseat or give fake spoilers. If the streamer needs help, they will ask designated chatters. All questions are rhetorical unless otherwise stated.`,
  )
})
