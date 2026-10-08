import { command } from '../services/permissions'

export default command('test', 'mod', async (_params, ctx) => {
  ctx.say('This is a test of the emergency bot system! 🚨')
})
