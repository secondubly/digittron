// hooks/useBotAudio.ts
import { useCallback } from 'react'
import { useCustomAudio } from './useCustomAudio'

interface FirstMessageEvent {
    chatterId: string
    chatterName: string
    message: string
    timestamp: string
}

interface BotAudioOptions {
    volume?: number
    muted?: boolean
    onFirstMessage?: (event: FirstMessageEvent) => void
}

export function useBotAudio({
    volume = 0.5,
    muted = false,
    onFirstMessage,
}: BotAudioOptions = {}) {
    const customAudio = useCustomAudio('/audio/first-message.mp3', volume)

    const playFirstMessage = useCallback(
        async (event: FirstMessageEvent) => {
            if (!muted) {
                // plays custom audio for chatter if set, otherwise default
                await customAudio.playForChatter(event.chatterId)
            }
            onFirstMessage?.(event)
        },
        [customAudio, muted, onFirstMessage],
    )

    return {
        playFirstMessage,
        customAudio, // expose for management UI (to be built!)
    }
}
