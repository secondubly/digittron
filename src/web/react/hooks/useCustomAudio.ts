import { useState, useCallback, useRef } from 'react'
import { useAudio } from './useAudio'

export interface CustomAudioEntry {
    chatterId: string
    chatterName: string
    audioUrl: string
    volume?: number
}

export function useCustomAudio(defaultUrl: string, defaultVolume = 0.5) {
    const [entries, setEntries] = useState<Map<string, CustomAudioEntry>>(
        new Map(),
    )

    // cache Audio instances so we don't recreate them on every play
    const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map())
    const defaultAudio = useAudio(defaultUrl, { volume: defaultVolume })

    const getAudioInstance = useCallback(
        (url: string, volume: number): HTMLAudioElement => {
            if (!audioCache.current.has(url)) {
                const audio = new Audio(url)
                audio.volume = volume
                audio.preload = 'auto'
                audioCache.current.set(url, audio)
            }
            return audioCache.current.get(url)!
        },
        [],
    )

    // ── Play audio for a specific chatter ─────────────────────────────────────

    const playForChatter = useCallback(
        async (chatterId: string) => {
            const entry = entries.get(chatterId)

            if (!entry) {
                // do nothing
                return
            }

            try {
                const audio = getAudioInstance(
                    entry.audioUrl,
                    entry.volume ?? defaultVolume,
                )
                audio.currentTime = 0
                await audio.play()
            } catch (err) {
                console.warn(`Audio play failed for ${chatterId}:`, err)
                await defaultAudio.play() // fall back to default on error
            }
        },
        [entries, defaultAudio, defaultVolume, getAudioInstance],
    )

    // ── Add entry ─────────────────────────────────────────────────────────────

    const addEntry = useCallback(
        (entry: CustomAudioEntry) => {
            setEntries((prev) => new Map(prev).set(entry.chatterId, entry))

            // preload the audio
            getAudioInstance(entry.audioUrl, entry.volume ?? defaultVolume)
        },
        [defaultVolume, getAudioInstance],
    )

    // ── Remove entry ──────────────────────────────────────────────────────────

    const removeEntry = useCallback((chatterId: string) => {
        setEntries((prev) => {
            const entry = prev.get(chatterId)

            // clean up cached Audio instance
            if (entry) {
                const audio = audioCache.current.get(entry.audioUrl)
                if (audio) {
                    audio.pause()
                    audio.src = ''
                }
                audioCache.current.delete(entry.audioUrl)
            }

            const next = new Map(prev)
            next.delete(chatterId)
            return next
        })
    }, [])

    // ── Update volume for a specific chatter ──────────────────────────────────

    const updateVolume = useCallback(
        (chatterId: string, volume: number) => {
            setEntries((prev) => {
                const entry = prev.get(chatterId)
                if (!entry) return prev
                return new Map(prev).set(chatterId, { ...entry, volume })
            })

            // update cached audio instance volume immediately
            const entry = entries.get(chatterId)
            if (entry) {
                const audio = audioCache.current.get(entry.audioUrl)
                if (audio) audio.volume = volume
            }
        },
        [entries],
    )

    // ── Helpers ───────────────────────────────────────────────────────────────

    const hasCustomAudio = useCallback(
        (chatterId: string) => {
            return entries.has(chatterId)
        },
        [entries],
    )

    // ── Cleanup all cached audio ──────────────────────────────────────────────

    const clearCache = useCallback(() => {
        audioCache.current.forEach((audio) => {
            audio.pause()
            audio.src = ''
        })
        audioCache.current.clear()
        setEntries(new Map())
    }, [])

    return {
        entries,
        playForChatter,
        addEntry,
        removeEntry,
        updateVolume,
        hasCustomAudio,
        clearCache,
    }
}
