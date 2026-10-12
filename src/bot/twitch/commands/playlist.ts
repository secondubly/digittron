// `@${chatterDisplayName} stream music playlist: https://open.spotify.com/playlist/666mjTAcb7PYiWEnincpNt?si=54d75be2632741ac`,

import { command } from '../services/permissions'

export default command('test', 'mod', async (_params, ctx) => {
  ctx.say(`@${ctx.userDisplayName} stream music playlist: https://open.spotify.com/playlist/666mjTAcb7PYiWEnincpNt?si=54d75be2632741ac`)
})
