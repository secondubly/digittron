import { useEffect } from 'react'
import { alertsHttp, alertsUrl, debug, volume } from '../config'
import { openSocket } from '../lib/socket'

let lastSound = 0

// Audio alerts pushed from the bot (see alerts.ts)
export function useAlerts() {
  useEffect(() => {
    if (alertsUrl === 'off') return
    return openSocket(alertsUrl, {
      onOpen: () => {
        if (debug) console.log('[alerts] connected')
      },
      onMessage: (data) => {
        let alert: { type?: string; sound?: string }
        try {
          alert = JSON.parse(data)
        } catch {
          return
        }
        if (debug) console.log('[alerts]', alert)
        if (alert.type !== 'first-message' || !alert.sound) return
        if (Date.now() - lastSound < 2000) return // avoid pile-ups during raids
        lastSound = Date.now()
        // audio is bundled with the build, so we can access it directly
        const audio = new Audio(`${alertsHttp}/audio/${encodeURIComponent(alert.sound)}`)
        audio.volume = volume
        audio.play().catch((err) => console.warn('Alert sound blocked:', err))
      },
    })
  }, [])
}
