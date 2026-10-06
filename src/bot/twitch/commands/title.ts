// commands/title.ts
import { command, hasLevel } from '../permissions.js'
import type { Deps } from '../deps.js'

export default function title({ api }: Deps) {
  return command('title', 'everyone', async (params, ctx) => {
    const broadcasterId = ctx.broadcasterId
    const newTitle = params.join(' ').trim()
    const canEdit = hasLevel(ctx.msg.userInfo, 'mod')

    if (!canEdit || !newTitle) {
      const channel = await api.channels.getChannelInfoById(broadcasterId)
      const current = channel?.title
      await ctx.reply(current ? `Current title: ${current}` : 'Could not fetch the current title.')
      return
    }

    await api.channels.updateChannelInfo(broadcasterId, { title: newTitle })
    await ctx.reply(`Title updated to: ${newTitle}`)
  })
}
