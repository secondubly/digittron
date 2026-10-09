import type { Deps } from '../deps'
import { command } from '../services/permissions'

export default function clip({ api }: Pick<Deps, "api">) {
    return command('clip', 'everyone', async (params, ctx) => {
        const broadcasterId = ctx.broadcasterId
        const title = params.join(" ").trim()

        const clip = await api.clips.createClip({
            channel: broadcasterId,
            title: title ?? undefined
        })

        const url = `https://clips.twitch.tv/${clip}`
        ctx.say(`@${ctx.userDisplayName} created a clip: ${url}`)
    })
}
