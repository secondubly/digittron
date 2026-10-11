import { log } from '@core/logger'
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

        let clipData = await api.clips.getClipById(clip)

        if (!clipData) {
            // wait 60 seconds and try again
            setTimeout(async () => {
                clipData = await api.clips.getClipById(clip)
                if (!clipData) {
                    log.twitch.warn('Failed to create clip')
                    ctx.say(`@${ctx.userDisplayName} something went wrong creating the clip.`)
                }
            }, 60_000)
        } else {
            ctx.say(`@${ctx.userDisplayName} created a clip: ${clipData.url}`)
        }

        return
    })
}
