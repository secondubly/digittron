import { createBotCommand, type BotCommand, type BotCommandContext } from '@twurple/easy-bot'
import type { ChatUser } from '@twurple/chat'
import { db } from '@core/db'
import { log } from '@core/logger'

export type PermissionLevel = 'everyone' | 'sub' | 'vip' | 'mod' | 'broadcaster'

type Cooldown = { global?: number; user?: number; exempt?: PermissionLevel } // cooldowns are in seconds

const lastGlobal = new Map<string, number>() // `${channel}:${command}` -> timestamp
const lastUser = new Map<string, number>() // `${channel}:${command}:${userId}` -> timestamp

function isOnCooldown(name: string, ctx: BotCommandContext, cd?: Cooldown): boolean {
  if (!cd) return false // if no cooldown
  if (cd.exempt && hasLevel(ctx.msg.userInfo, cd.exempt)) return false // if exemption level set, and you are of that level or higher

  const now = Date.now() // milliseconds!
  const gKey = `${ctx.broadcasterName}:${name}` // REVIEW: should we make this the channel id instead?
  const uKey = `${gKey}:${ctx.userId}`

  if (cd.global && now - (lastGlobal.get(gKey) ?? 0) < cd.global * 1000) return true
  if (cd.user && now - (lastUser.get(uKey) ?? 0) < cd.user * 1000) return true

  if (cd.global) lastGlobal.set(gKey, now)
  if (cd.user) lastUser.set(uKey, now)
  return false
}

const levels: Record<PermissionLevel, (u: ChatUser) => boolean> = {
  everyone: () => true,
  sub: (u) => u.isSubscriber || u.isVip || u.isMod || u.isBroadcaster,
  vip: (u) => u.isVip || u.isMod || u.isBroadcaster,
  mod: (u) => u.isMod || u.isBroadcaster,
  broadcaster: (u) => u.isBroadcaster,
}

const insertUsage = db.prepare(
  `INSERT INTO command_usage (used_at, command, user_id, user_name, channel_id, status, duration_ms)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
)

export type CommandHandler = (params: string[], ctx: BotCommandContext) => void | Promise<void>

export function command(
  name: string,
  level: PermissionLevel,
  handler: CommandHandler,
  options?: Parameters<typeof createBotCommand>[2],
  cooldown?: Cooldown
): BotCommand {
  return createBotCommand(
    name,
    async (params, ctx) => {
      const start = performance.now()
      let status: 'ok' | 'error' | 'denied' = 'ok' // REVIEW: should we add a cooldown status?

      if (!levels[level](ctx.msg.userInfo)) return
      if (isOnCooldown(name, ctx, cooldown)) return // or ctx.reply('Slow down!') if you want feedback
      await handler(params, ctx)

      if (!levels[level](ctx.msg.userInfo)) {
        status = 'denied'
        return
      } else if (isOnCooldown(name, ctx, cooldown)) return
      else {
        try {
          await handler(params, ctx)
        } catch (err) {
          status = 'error'
          log.twitch.info({ err, command: name }, 'command failed')
        }        
      } 

      insertUsage.run(
        Date.now(),
        name,
        ctx.userId,
        ctx.userName,
        ctx.broadcasterId,
        status,
        Math.round(performance.now() - start),
      )
    },
    options,
  )
}

export function hasLevel(user: ChatUser, level: PermissionLevel): boolean {
  return levels[level](user)
}
