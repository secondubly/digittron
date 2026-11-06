import { ArcClient, type ArcClientOptions } from 'arcscord'
import { GatewayIntentBits } from 'discord.js'
import handlers from './handlers'

const init = async () => {
  if (!Bun.env.DISCORD_TOKEN) {
    throw Error('Missing discord token, please check environment variables.')
  }

  const intents = Bun.env.HONEYPOT_CHANNEL_ID
    ? [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ]
    : [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
  const arcClientOptions: ArcClientOptions = {
    intents,
    applicationId: Bun.env.DISCORD_APP_ID ?? undefined,
    logger: {
      format: 'pretty',
      level: Bun.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  }

  const discord = new ArcClient(Bun.env.DISCORD_TOKEN, arcClientOptions)
  await discord.loadHandlers(handlers)

  try {
    await discord.login()
  } catch (err) {
    discord.logger.error(`error: ${err}`)
  }
}

if (import.meta.main) {
  await init()
}
