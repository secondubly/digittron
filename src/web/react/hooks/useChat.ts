import { useEffect, useState } from 'react'
import type { ChatEvent } from '@core/chatEvents'
import { mock, alertsUrl, channel, debug, hide, max, ttl } from '../config'
import { fallbackColor } from '../lib/colors'
import { expandThirdParty, loadThirdParty } from '../lib/emotes'
import { fragmentsToParts } from '../lib/fragments'
import { openSocket } from '../lib/socket'
import type { Msg } from '../types'
import { fixtures, randomMessage } from '../lib/mock'

export function useChat(): Msg[] {
    const [messages, setMessages] = useState<Msg[]>([])

    useEffect(() => {
        if (alertsUrl === 'off' || mock) return

        return openSocket(alertsUrl, {
            onOpen: () => {
                if (debug) console.log('[chat] connected to bot')
            },
            onMessage: (data) => {
                let event: ChatEvent
                try {
                    event = JSON.parse(data) as ChatEvent
                } catch {
                    return
                }
                if (debug) console.log('[chat]', event)

                // alert events share this socket; they fall through the switch untouched
                switch (event.type) {
                    case 'chat': {
                        if (channel && event.channel !== channel) return // optional ?channel= filter
                        if (hide.has(event.login)) return
                        if (event.kind === 'chat' && event.text.startsWith('!')) return // ignore commands

                        void loadThirdParty(event.roomId) // no-op after the first call

                        const msg: Msg = {
                            id: event.id,
                            userId: event.userId,
                            name: event.name,
                            color: event.color || fallbackColor(event.name),
                            action: false, // EventSub doesn't mark /me messages
                            parts: expandThirdParty(fragmentsToParts(event.fragments)),
                            at: Date.now(),
                            kind: event.kind,
                            headline: event.headline,
                        }
                        setMessages((prev) => [...prev, msg].slice(-max))
                        return
                    }
                    case 'chat-remove':
                        setMessages((prev) => prev.filter((m) => m.id !== event.id))
                        return
                    case 'chat-clear':
                        setMessages((prev) => (event.userId ? prev.filter((m) => m.userId !== event.userId) : []))
                        return
                }
            },
        })
    }, [])

  useEffect(() => {
    if (!mock) return

    if (mock === 'static') {
        console.log('mock is static')
        setMessages(fixtures())
        return
    }

    // otherwise stream a random fixture every 1.5 seconds
    const t = setInterval(() => setMessages((prev) => [...prev, randomMessage()].slice(-max)), 1500)
    return () => clearInterval(t)
  }, [])

    // Expire old messages
    useEffect(() => {
        if (!ttl) return
        const t = setInterval(() => {
            const cutoff = Date.now() - ttl
            setMessages((prev) => (prev.some((m) => m.at < cutoff) ? prev.filter((m) => m.at >= cutoff) : prev))
        }, 1000)
        return () => clearInterval(t)
    }, [])

    return messages
}
