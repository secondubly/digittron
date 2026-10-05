import { command } from '../permissions';

export default command('backseat', 'everyone', async (_params, ctx) => {
    const broadcasterName = ctx.broadcasterName
    ctx.say(`Please do not backseat the streamer! when @${broadcasterName} needs help, they will ask for it! Thank you!`)
  })