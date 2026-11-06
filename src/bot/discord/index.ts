import { ArcClient, type ArcClientOptions, type LoggerInterface } from 'arcscord'
import { GatewayIntentBits } from 'discord.js'
import handlers from './handlers'
import { log } from '@core/logger'

const startBot = async () => {
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
      customLogger: class PinoLogger implements LoggerInterface {
        #inner: LoggerInterface = log.discord

        trace = this.#inner.trace;
        debug = this.#inner.debug;
        info = this.#inner.info;
        warn = this.#inner.warn;
        error = this.#inner.error;
        logError = this.#inner.logError;
        fatal = this.#inner.fatal;
        fatalError = this.#inner.fatalError;
        log = this.#inner.log;
        child = this.#inner.child;
      },
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
  await startBot()
}

export { startBot }