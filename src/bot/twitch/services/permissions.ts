import { createBotCommand, type BotCommand, type BotCommandContext } from '@twurple/easy-bot'
import type { ChatUser } from '@twurple/chat'
import { db } from './db'
import { log } from '@core/logger'

export type PermissionLevel = 'everyone' | 'sub' | 'vip' | 'mod' | 'broadcaster'

const levels: Record<PermissionLevel, (u: ChatUser) => boolean> = {
  everyone: () => true,
  sub: (u) => u.isSubscriber || u.isVip || u.isMod || u.isBroadcaster,
  vip: (u) => u.isVip || u.isMod || u.isBroadcaster,
  mod: (u) => u.isMod || u.isBroadcaster,
  broadcaster: (u) => u.isBroadcaster,
}

const insertUsage = db.prepare(
  `INSERT INTO command_usage (used_at, command, user_id, user_name, channel, status, duration_ms)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
)

export type CommandHandler = (params: string[], ctx: BotCommandContext) => void | Promise<void>

export function command(
  name: string,
  level: PermissionLevel,
  handler: CommandHandler,
  options?: Parameters<typeof createBotCommand>[2],
): BotCommand {
  return createBotCommand(
    name,
    async (params, ctx) => {
      const start = performance.now()
      let status: 'ok' | 'error' | 'denied' = 'ok'

      if (!levels[level](ctx.msg.userInfo)) {
        status = 'denied'
      } else {
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
        ctx.broadcasterName,
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
