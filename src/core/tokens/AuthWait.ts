import { log } from '../utils/logger'
import { EventEmitter } from 'events'

export class AuthWaiter extends EventEmitter {
  /**
   * Resolves once a token for the given key becomes available.
   * Call `notify(key)` from the OAuth callback route when a token is saved.
   */
  waitFor(tokenKey: string, timeoutMs?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      let timer: NodeJS.Timeout | null = null
      const onAuth = (key: string) => {
        if (key !== tokenKey) return

        if (timer) clearTimeout(timer)

        // .off() is alias for removeListener
        this.off('authenticated', onAuth)
        resolve()
      }

      this.on('authenticated', onAuth)
      if (timeoutMs) {
        timer = setTimeout(() => {
          this.off('authenticated', onAuth)
          reject(new Error(`Timed out waiting for auth: ${tokenKey}`))
        }, timeoutMs)
      }
    })
  }

  notify(tokenKey: string): void {
    log.bot.info(`Auth completed for ${tokenKey}`)
    this.emit('authenticated', tokenKey)
  }
}
