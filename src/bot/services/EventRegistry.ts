import path from 'path'
import fs from 'fs/promises'
import type { BotEvent, BotContext } from '../events/types'
import { log } from '@core/utils/logger'

export class EventRegistry {
  private readonly events: BotEvent[] = []

  async loadEvents(dir: string, deps?: unknown): Promise<void> {
    const walk = async (folder: string) => {
      const entries = await fs.readdir(folder, { withFileTypes: true })

      await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(folder, entry.name)

          if (entry.isDirectory()) {
            await walk(fullPath)
            return
          }

          // TODO: add a check for js files and NODE_ENV = prod
          if (!entry.name.endsWith('.ts') || entry.name === 'types.ts') return

          const mod = await import(fullPath)
          const exported = mod.default

          const event: BotEvent =
            typeof exported === 'function' ? exported(deps) : exported

          if (typeof event?.register !== 'function') {
            console.warn(
              `${fullPath} — register function is not valid, skipping`,
            )
            return
          }

          if (!event?.type || !event?.register) {
            log.bot.warn(`Skipping ${fullPath} — not a valid BotEvent`)
            return
          }

          this.events.push(event)
        }),
      )
    }

    await walk(dir)
  }

  // ── Register all loaded events ────────────────────────────────────────────

  registerAll(ctx: BotContext): void {
    this.events.forEach((event) => {
      try {
        event.register(ctx)
      } catch (err) {
        console.error(`Failed to register ${event.name}:`, err)
      }
    })
  }

  add(...events: BotEvent[]): this {
    this.events.push(...events)
    return this
  }

  list(): BotEvent[] {
    return [...this.events]
  }
}
