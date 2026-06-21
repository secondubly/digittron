// hooks/useAudioAlerts.ts
import { useState, useEffect, useCallback } from 'react'

export interface AudioAlertRecord {
    id: number
    chatterId: string
    chatterName: string
    audioUrl: string
    filename: string
    volume: number
    enabled: boolean
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export function useAudioAlerts() {
    const [alerts, setAlerts] = useState<AudioAlertRecord[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAlerts = useCallback(async () => {
        setLoading(true)
        const res = await fetch(`${API}/api/audio/alerts`, {
            credentials: 'include',
        })
        const data = await res.json()
        setAlerts(data.alerts ?? [])
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchAlerts()
    }, [fetchAlerts])

    const uploadAlert = useCallback(
        async (
            file: File,
            chatterId: string,
            chatterName: string,
            volume: number = 0.5,
        ) => {
            const formData = new FormData()
            formData.append('audio', file)
            formData.append('chatterId', chatterId)
            formData.append('chatterName', chatterName)
            formData.append('volume', String(volume))

            const res = await fetch(`${API}/api/audio/alerts`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            })

            const data = await res.json()
            setAlerts((prev) => {
                const filtered = prev.filter((a) => a.chatterId !== chatterId)
                return [...filtered, data.alert]
            })

            return data.alert as AudioAlertRecord
        },
        [],
    )

    const updateAlert = useCallback(
        async (id: number, updates: { volume?: number; enabled?: boolean }) => {
            await fetch(`${API}/api/audio/alerts/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            })

            setAlerts((prev) =>
                prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
            )
        },
        [],
    )

    const deleteAlert = useCallback(async (id: number) => {
        await fetch(`${API}/api/audio/alerts/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        })
        setAlerts((prev) => prev.filter((a) => a.id !== id))
    }, [])

    return {
        alerts,
        loading,
        uploadAlert,
        updateAlert,
        deleteAlert,
        refetch: fetchAlerts,
    }
}
