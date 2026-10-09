// commands/game.ts
import { command, hasLevel } from "../services/permissions"
import type { Deps } from "../deps"
import { log } from "@core/logger"

export default function gameCommand({ api }: Pick<Deps, "api">) {
    return command("game", "everyone", async (params, ctx) => {
        const query = params.join(" ").trim()
        const canEdit = hasLevel(ctx.msg.userInfo, "mod")
        const broadcasterId = ctx.broadcasterId
        // Viewers, or mods with no argument: show the current category
        if (!canEdit || !query) {
            const channel = await api.channels.getChannelInfoById(broadcasterId)
            await ctx.reply(
                channel?.gameName
                    ? `Current category: ${channel.gameName}`
                    : "Could not fetch the current category.",
            )
            return
        }

        try {
            let game = await api.games.getGameByName(query)
            if (!game) {
                const results = await api.search.searchCategories(query)
                game = results.data[0] ?? null
            }

            if (!game) {
                await ctx.reply(`No category found for “${query}”.`)
                return
            }

            await api.channels.updateChannelInfo(broadcasterId, { gameId: game.id })
            ctx.reply(`Category updated to: ${game.name}`)
        } catch (err) {
            log.twitch.error({ err }, 'Failed to update category')
            ctx.reply("Could not update the category.")
        }
    })
}