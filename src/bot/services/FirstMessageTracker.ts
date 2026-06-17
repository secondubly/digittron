import { log } from 'src/core/utils/logger'

export class FirstMessageTracker {
    private readonly seen = new Set<string>()
    private online = false

    setOnline(): void {
        this.online = true
        this.seen.clear() // reset on each new stream
        log.bot.info('🟢  First message tracker active')
    }

    setOffline(): void {
        this.online = false
        this.seen.clear()
        log.bot.info('🔴  First message tracker cleared')
    }

    isFirstMessage(chatterId: string): boolean {
        if (!this.online) return false
        if (this.seen.has(chatterId)) return false

        this.seen.add(chatterId)
        return true
    }

    isOnline(): boolean {
        return this.online
    }
    seenCount(): number {
        return this.seen.size
    }
    hasSeen(id: string): boolean {
        return this.seen.has(id)
    }

    reset(): void {
        this.seen.clear()
    }
}
