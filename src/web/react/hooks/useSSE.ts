import { useEffect, useRef, useCallback } from 'react'

type SSEEventMap = {
    connected: { status: string }
    firstMessage: { chatterId: string; chatterName: string; message: string }
}

type SSEHandler<K extends keyof SSEEventMap> = (data: SSEEventMap[K]) => void

type SSEHandlers = {
    [K in keyof SSEEventMap]?: SSEHandler<K>
}

interface UseSSEOptions {
    handlers: SSEHandlers
    reconnectDelay?: number
    enabled?: boolean
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export function useSSE({
    handlers,
    reconnectDelay = 3_000,
    enabled = true,
}: UseSSEOptions) {
    const esRef = useRef<EventSource | null>(null)
    const handlersRef = useRef(handlers)
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    // keep handlers ref current without re-subscribing
    useEffect(() => {
        handlersRef.current = handlers
    }, [handlers])

    const connect = useCallback(() => {
        if (!enabled) return

        const es = new EventSource(`${API}/api/audio/events`, {
            withCredentials: true,
        })
        esRef.current = es

        es.onopen = () => {
            console.log('SSE connected')
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current)
                reconnectTimer.current = null
            }
        }

        // register typed event listeners
        const events = Object.keys(handlersRef.current) as (keyof SSEEventMap)[]
        events.forEach((event) => {
            es.addEventListener(event, (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data)
                    const handler = handlersRef.current[event] as SSEHandler<
                        typeof event
                    >
                    handler?.(data)
                } catch (err) {
                    console.error(`SSE parse error for event "${event}":`, err)
                }
            })
        })

        es.onerror = () => {
            console.warn('⚠️  SSE disconnected — reconnecting...')
            es.close()
            esRef.current = null
            reconnectTimer.current = setTimeout(connect, reconnectDelay)
        }
    }, [enabled, reconnectDelay])

    useEffect(() => {
        connect()

        return () => {
            esRef.current?.close()
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
        }
    }, [connect])
}
