import { useCallback } from 'react'
import { useCustomAudio } from './useCustomAudio'

interface FirstMessageEvent {
  chatterId: string
  chatterName: string
  message: string
  timestamp: string
}

interface BotAudioOptions {
  muted?: boolean
  onFirstMessage?: (event: FirstMessageEvent) => void
}

export function useBotAudio({
  muted = false,
  onFirstMessage,
}: BotAudioOptions = {}) {
  // ── Custom per-user audio — loaded from DB ────────────────────────────────
  const customAudio = useCustomAudio('/audio/first-message.mp3')

  // ── Play handlers ─────────────────────────────────────────────────────────

  const playFirstMessage = useCallback(
    async (event: FirstMessageEvent) => {
      if (!muted) {
        // plays custom audio for chatter if found in DB, else default
        await customAudio.playForChatter(event.chatterId)
      }
      onFirstMessage?.(event)
    },
    [customAudio, muted, onFirstMessage],
  )
  return {
    playFirstMessage,
    customAudio, // expose for CustomAudioManager
  }
}
