import { createBotCommand, type BotCommand, type BotCommandContext } from '@twurple/easy-bot';
import type { ChatUser } from '@twurple/chat';

export type PermissionLevel = 'everyone' | 'sub' | 'vip' | 'mod' | 'broadcaster';

const levels: Record<PermissionLevel, (u: ChatUser) => boolean> = {
  everyone: () => true,
  sub: (u) => u.isSubscriber || u.isVip || u.isMod || u.isBroadcaster,
  vip: (u) => u.isVip || u.isMod || u.isBroadcaster,
  mod: (u) => u.isMod || u.isBroadcaster,
  broadcaster: (u) => u.isBroadcaster,
};

export type CommandHandler = (params: string[], ctx: BotCommandContext) => void | Promise<void>;

export function command(
  name: string,
  level: PermissionLevel,
  handler: CommandHandler,
  options?: Parameters<typeof createBotCommand>[2],
): BotCommand {
  return createBotCommand(
    name,
    async (params, ctx) => {
      if (!levels[level](ctx.msg.userInfo)) return;
      await handler(params, ctx);
    },
    options,
  );
}

export function hasLevel(user: ChatUser, level: PermissionLevel): boolean {
  return levels[level](user);
}