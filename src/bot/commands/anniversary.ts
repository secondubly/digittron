import type { Command, CommandContext } from '@lib/bot/types.js'
import { config } from 'src/config'

const anniversary: Command = {
    name: 'anniversary',
    aliases: ['anni'],
    description: 'Anniversary stream inforamtion',
    execute: async function (ctx: CommandContext): Promise<void> {
        const broadcaster = ctx.channel
        ctx.client.chat.sendChatMessageAsApp(
            config.TWITCH_BOT_ID,
            config.TWITCH_BROADCASTER_ID,
            `@${broadcaster}'s stream anniversary celebration is september 27 - september 30!
            During this time we have various sub goals and individual sub rewards that you can see by using !subgoal.
            All proceeds will be going to updating my pngtuber model!`,
        )
    },
}
export default anniversary
