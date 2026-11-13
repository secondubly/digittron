import type { ApiClient } from '@twurple/api'
import { command } from '../services/permissions' // adjust the path to your wrapper
import { log } from '@core/logger'

const NAME = /^[a-z0-9_]{1,25}$/ // Twitch login names

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`

// Counts calendar months, not 30-day blocks. Falls back to hours and minutes if followed less than 24 hours ago
function formatAge(from: Date, to = new Date()): string {
    let years = to.getUTCFullYear() - from.getUTCFullYear()
    let months = to.getUTCMonth() - from.getUTCMonth()
    let days = to.getUTCDate() - from.getUTCDate()

    if (days < 0) {
        months -= 1
        days += new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 0)).getUTCDate() // days in the month before `to`
    }
    if (months < 0) {
        years -= 1
        months += 12
    }

    const parts: string[] = []
    if (years > 0) parts.push(plural(years, 'year'))
    if (months > 0) parts.push(plural(months, 'month'))
    if (days > 0) parts.push(plural(days, 'day'))
    if (parts.length > 0) return parts.join(', ')

    // followed less than a day ago
    const minutes = Math.max(0, Math.floor((to.getTime() - from.getTime()) / 60_000))
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${plural(hours, 'hour')}, ${plural(minutes % 60, 'minute')}`
    return minutes > 0 ? plural(minutes, 'minute') : 'less than a minute'
}

export default function followageCommand({ api }: { api: ApiClient }) {
    return command(
        'followage',
        'everyone',
        async (params, ctx) => {
            const channelId = ctx.broadcasterId
            if (!channelId) return

            let targetId = ctx.userId ?? ''
            let targetName = ctx.userDisplayName

            const arg = params[0]?.replace(/^@/, '').toLowerCase()
            if (arg) {
                if (!NAME.test(arg)) {
                    await ctx.reply('That is not a valid Twitch username.')
                    return
                }
                const user = await api.users.getUserByName(arg).catch(() => null)
                if (!user) {
                    await ctx.reply('I could not find that user.')
                    return
                }
                targetId = user.id
                targetName = user.displayName
            }

            if (targetId === channelId) {
                await ctx.reply(`${targetName} is the broadcaster of this channel.`)
                return
            }

            try {
                const { data } = await api.channels.getChannelFollowers(channelId, targetId)
                const follow = data[0]
                if (!follow) {
                    await ctx.reply(`${targetName} is not following ${ctx.broadcasterName}.`)
                    return
                }

                const since = follow.followDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC',
                })
                await ctx.reply(
                    `${targetName} has been following ${ctx.broadcasterName} for ${formatAge(follow.followDate)} (since ${since}).`,
                )
            } catch (err) {
                log.twitch.error({ err, channelId }, 'follow lookup failed')
                await ctx.reply("I couldn't look up follow info right now.")
            }
        },
        { userCooldown: 10, globalCooldown: 2 },
    )
}