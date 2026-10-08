import { command } from '../services/permissions'
import { sendAlert } from '../../../web/alerts'

export default command('testalert', 'broadcaster', async (_params, ctx) => {
  console.log('testing sound alerts')
  sendAlert(
    {
      type: 'first-message',
      name: ctx.msg.userInfo.displayName,
      sound: '89181064.mp3', // must exist in your sounds/ folder
    },
    Bun.env.WEB_PORT ?? '3000',
  )
})
