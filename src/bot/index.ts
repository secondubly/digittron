import type { Twitch } from "@core/twitch"
import { startBot as twitchStart } from "./twitch"
import { startBot as discordStart } from "./discord"

const startBots = async (twitch: Twitch)=> {
    await twitchStart(twitch)
    await discordStart()
}

export { startBots }