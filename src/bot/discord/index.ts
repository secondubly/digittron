import { ArcClient, type ArcClientOptions } from "arcscord";
import { GatewayIntentBits } from "discord.js";
import { commands } from "./commands";

const init = async () => {
    if (!Bun.env.DISCORD_TOKEN) {
        throw Error('Missing discord token, please check environment variables.')
    }

    const arcClientOptions: ArcClientOptions = {
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
        applicationId: Bun.env.DISCORD_APP_ID ?? undefined,
        logger: {
            format: 'pretty',
            level: "debug"
        }
    }

    const discord = new ArcClient(Bun.env.DISCORD_TOKEN, arcClientOptions)

    if (Bun.env.DISCORD_APP_ID) {
        await discord.loadCommands(commands)
    }

    try {
        await discord.login()
    } catch (err) {
        console.error('error', err)
    }

    discord.on('clientReady', async () => {
        if (!Bun.env.DISCORD_APP_ID) {
            await discord.loadCommands(commands)
        }
        
        discord.logger.info("ready!")
    })
    
}

if (import.meta.main) {
    await init()
}