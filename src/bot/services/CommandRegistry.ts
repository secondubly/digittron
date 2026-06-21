import path from 'path'
import fs from 'fs/promises'
import type { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'
import type { Command, CommandContext, CommandDeps } from '../types.js'
import type { ApiClient } from '@twurple/api'
import { log } from '@core/utils/logger.js'
import { config } from '@core/config/env.js'

type SayFn = (channel: string, message: string) => Promise<void>

export class CommandRegistry {
  private readonly commands = new Map<string, Command>()
  // structure: Map<commandName, Map<username, Date>>
  // TODO: this should be a global cooldown, not per-user
  private readonly cooldowns = new Map<string, Map<string, number>>()

  constructor(
    private readonly prefix: string = '!',
    private readonly say: SayFn,
  ) {}

  async loadCommands(dir: string, deps: CommandDeps): Promise<void> {
    const files = await fs.readdir(dir)

    const imports = files
      .filter((f) =>
        config.NODE_ENV === 'development'
          ? f.endsWith('.ts')
          : f.endsWith('.js'),
      )
      .map((f) => path.join(dir, f))

    await Promise.all(
      imports.map(async (filePath) => {
        const mod = await import(filePath)
        const exported = mod.default

        const command: Command =
          typeof exported === 'function' ? exported(deps) : exported

        if (!command?.name || !command?.execute) {
          log.bot.warn(`Skipping load of ${filePath} – not a valid command`)
          return
        }

        this.register(command)
        log.bot.debug(`Loaded command: !${command.name}`)
      }),
    )
  }

  register(...commands: Command[]): this {
    commands.forEach((cmd) => {
      this.commands.set(cmd.name, cmd)
      cmd.aliases?.forEach((alias) => this.commands.set(alias, cmd))
    })
    return this
  }

  async dispatch(
    msg: EventSubChannelChatMessageEvent,
    client: ApiClient,
  ): Promise<void> {
    const text = msg.messageText.trim()
    if (!text.startsWith(this.prefix)) return

    const [trigger, ...args] = text
      .slice(this.prefix.length)
      .trim()
      .split(/\s+/)
    const command = this.commands.get(trigger.toLowerCase())

    if (!command) return

    // mod-only check
    if (command.modOnly && !this.isMod(msg)) {
      log.bot.warn(`${msg.chatterName} tried to execute a mod-only command`)
      return
    }

    if (this.isOnCooldown(command, msg.chatterId)) {
      return
    }

    this.setCooldown(command, msg.chatterId)

    const ctx: CommandContext = {
      client,
      channel: msg.broadcasterName,
      msg: msg,
      args,
      rawMsg: text,
      say: (message: string) => this.say(msg.broadcasterName, message),
    }
    await command.execute(ctx)
  }

  list(): Command[] {
    return [...new Set(this.commands.values())]
  }

  private isMod(msg: EventSubChannelChatMessageEvent): boolean {
    // broadcaster is considered a mod in almost all cases
    return (
      msg.chatterId === msg.broadcasterId ||
      Object.keys(msg.badges).some((b) => b === 'moderator')
    )
  }

  private isOnCooldown(command: Command, chatterId: string): boolean {
    if (!command.cooldownMs) return false
    const lastExecuteMs = this.cooldowns.get(command.name)?.get(chatterId) ?? 0
    return Date.now() - lastExecuteMs < command.cooldownMs
  }

  private setCooldown(command: Command, chatterId: string): void {
    if (!command.cooldownMs) return
    if (!this.cooldowns.has(command.name)) {
      this.cooldowns.set(command.name, new Map())
    }
    this.cooldowns.get(command.name)!.set(chatterId, Date.now())
  }
}
