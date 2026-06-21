import { useCallback, useRef, useEffect } from 'react'
import { useAudio } from './useAudio'
import { useAudioAlerts } from './useAudioAlerts'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export function useCustomAudio(defaultUrl: string, defaultVolume = 0.5) {
  const { alerts, loading, uploadAlert, updateAlert, deleteAlert } =
    useAudioAlerts()

  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map())
  const defaultAudio = useAudio(defaultUrl, { volume: defaultVolume })

  useEffect(() => {
    if (loading) return

    alerts.forEach((alert) => {
      if (!alert.enabled) return

      // skip if already cached
      if (audioCache.current.has(alert.chatterId)) return

      const audio = new Audio(`${API}${alert.audioUrl}`)
      audio.volume = alert.volume
      audio.preload = 'auto'

      // preload
      audio.load()

      audioCache.current.set(alert.chatterId, audio)
      console.log(
        `🎵  Preloaded audio for ${alert.chatterName} (${alert.chatterId})`,
      )
    })

    // clean up cache entries that were removed from DB
    for (const [chatterId] of audioCache.current) {
      const stillExists = alerts.some((a) => a.chatterId === chatterId)
      if (!stillExists) {
        const audio = audioCache.current.get(chatterId)
        if (audio) {
          audio.pause()
          audio.src = ''
        }
        audioCache.current.delete(chatterId)
      }
    }
  }, [alerts, loading])

  const getAudioInstance = useCallback(
    (url: string, volume: number): HTMLAudioElement => {
      if (!audioCache.current.has(url)) {
        const audio = new Audio(url)
        audio.volume = volume
        audio.preload = 'auto'
        audio.load()
        audioCache.current.set(url, audio)
      }
      return audioCache.current.get(url)!
    },
    [],
  )

  const playForChatter = useCallback(
    async (chatterId: string) => {
      const alert = alerts.find((a) => a.chatterId === chatterId && a.enabled)

      if (!alert) {
        await defaultAudio.play()
        return
      }

      try {
        const cached = audioCache.current.get(chatterId)
        const audio =
          cached ?? getAudioInstance(`${API}${alert.audioUrl}`, alert.volume)

        audio.currentTime = 0
        await audio.play()
      } catch (err) {
        console.warn(`Audio play failed for ${chatterId}:`, err)
        await defaultAudio.play()
      }
    },
    [alerts, defaultAudio, getAudioInstance],
  )

  const addEntry = useCallback(
    async (
      file: File,
      chatterId: string,
      chatterName: string,
      volume: number = 0.5,
    ) => {
      const alert = await uploadAlert(file, chatterId, chatterName, volume)

      // immediately cache the new audio
      const audio = new Audio(`${API}${alert.audioUrl}`)
      audio.volume = volume
      audio.preload = 'auto'
      audio.load()
      audioCache.current.set(chatterId, audio)

      return alert
    },
    [uploadAlert],
  )

  const removeEntry = useCallback(
    async (id: number, chatterId: string) => {
      await deleteAlert(id)

      const audio = audioCache.current.get(chatterId)
      if (audio) {
        audio.pause()
        audio.src = ''
      }
      audioCache.current.delete(chatterId)
    },
    [deleteAlert],
  )

  const updateVolume = useCallback(
    async (id: number, chatterId: string, volume: number) => {
      await updateAlert(id, { volume })

      const audio = audioCache.current.get(chatterId)
      if (audio) audio.volume = volume
    },
    [updateAlert],
  )

  const toggleEnabled = useCallback(
    async (id: number, enabled: boolean) => {
      await updateAlert(id, { enabled })
    },
    [updateAlert],
  )

  const clearCache = useCallback(() => {
    audioCache.current.forEach((audio) => {
      audio.pause()
      audio.src = ''
    })
    audioCache.current.clear()
  }, [])

  useEffect(() => {
    return () => clearCache()
  }, [clearCache])

  return {
    alerts,
    loading,
    playForChatter,
    addEntry,
    removeEntry,
    updateVolume,
    toggleEnabled,
    hasCustomAudio: (chatterId: string) =>
      alerts.some((a) => a.chatterId === chatterId && a.enabled),
    clearCache,
  }
}
