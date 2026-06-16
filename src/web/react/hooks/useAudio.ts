import { useRef, useCallback } from 'react'

interface AudioOptions {
    volume?: number // 0–1
    preload?: boolean
}

export function useAudio(src: string, options: AudioOptions = {}) {
    const { volume = 0.5, preload = true } = options
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // lazy init — create audio element once
    const getAudio = useCallback(() => {
        if (!audioRef.current) {
            const audio = new Audio(src)
            audio.volume = volume
            audio.preload = preload ? 'auto' : 'none'
            audioRef.current = audio
        }
        return audioRef.current
    }, [src, volume, preload])

    const play = useCallback(async () => {
        try {
            const audio = getAudio()
            audio.currentTime = 0 // rewind so it can play again immediately
            await audio.play()
        } catch (err) {
            // browsers block autoplay without prior user interaction
            console.warn('Audio play blocked:', err)
        }
    }, [getAudio])

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
    }, [])

    const setVolume = useCallback((v: number) => {
        if (audioRef.current)
            audioRef.current.volume = Math.max(0, Math.min(1, v))
    }, [])

    return { play, stop, setVolume }
}
