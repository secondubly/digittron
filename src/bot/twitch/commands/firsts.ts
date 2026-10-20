import { command } from '../services/permissions'
import { getLeaderboard, getUserFirsts } from '../services/firsts'

export default command(
    'firsts',
    'everyone',
    async (_params, ctx) => {
        const top = getLeaderboard(5)
        if (top.length === 0) {
            await ctx.reply('Nobody has claimed first yet!')
            return
        }

        const board = top.map((row, i) => `${i + 1}. ${row.name} (${row.firsts})`).join(' | ')
        const mine = getUserFirsts(ctx.userId)
        await ctx.reply(`First leaderboard: ${board}${mine > 0 ? ` | You: ${mine}` : ''}`)
    },
    { globalCooldown: 15 },
)