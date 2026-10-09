import { useEffect, useState } from 'react'
import { channel, debug, hide, max, ttl } from '../config'
import { fallbackColor } from '../lib/colors'
import { buildParts, expandThirdParty, loadThirdParty } from '../lib/emotes'
import { parseLine } from '../lib/irc'
import { openSocket } from '../lib/socket'
import type { Msg } from '../types'
import { cheerHeadline, subHeadline } from '../lib/headlines'

export function useChat(): Msg[] {
  const [messages, setMessages] = useState<Msg[]>([])

  // Read chat anonymously over Twitch IRC
  useEffect(() => {
    if (!channel) return
    return openSocket('wss://irc-ws.chat.twitch.tv:443', {
      onOpen: (ws: WebSocket) => {
        if (debug) console.log(`[chat] connected, joining #${channel}`)
        ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands')
        ws.send('PASS SCHMOOPIIE')
        ws.send(`NICK justinfan${Math.floor(Math.random() * 80000) + 1000}`)
        ws.send(`JOIN #${channel}`)
      },
      onClose: (byCleanup: boolean) => {
        if (debug) console.log('[chat] socket closed', byCleanup ? '(cleanup)' : '(will retry)')
      },
      onMessage: (data, ws: WebSocket) => {
        for (const raw of data.split('\r\n').filter(Boolean)) {
          if (debug) console.log('[irc]', raw)
          if (raw.startsWith('PING')) {
            ws.send('PONG :tmi.twitch.tv')
            continue
          }
          const { tags, prefix, command, text } = parseLine(raw)
          if (tags['room-id']) void loadThirdParty(tags['room-id']) // no-op after the first call

          if (command === 'PRIVMSG') {
            const login = prefix.split('!')[0] ?? ''
            let body = text
            const action = body.startsWith('\u0001ACTION ')
            if (action) body = body.slice(8, -1)
            if (hide.has(login) || body.startsWith('!')) continue
            const name = tags['display-name'] || login
            const headline = cheerHeadline(tags)
            const msg: Msg = {
              id: tags['id'] || crypto.randomUUID(),
              userId: tags['user-id'] ?? '',
              name,
              color: tags['color'] || fallbackColor(name),
              action,
              parts: expandThirdParty(buildParts(body, tags['emotes'] ?? '')),
              at: Date.now(),
              kind: headline ? 'cheer' : 'chat',
              headline: headline ?? undefined,
            }
            setMessages((prev) => [...prev, msg].slice(-max))
          } else if (command === 'CLEARCHAT') {
            const target = tags['target-user-id']
            setMessages((prev) => (target ? prev.filter((m) => m.userId !== target) : []))
          } else if (command === 'CLEARMSG') {
            setMessages((prev) => prev.filter((m) => m.id !== tags['target-msg-id']))
          } else if (command === 'USERNOTICE') {
            const headline = subHeadline(tags)
            if (!headline) continue // raids, gifts and the rest are ignored for now

            const login = tags['login'] ?? ''
            const name = tags['display-name'] || login
            const msg: Msg = {
              id: tags['id'] || crypto.randomUUID(),
              userId: tags['user-id'] ?? '',
              name,
              color: tags['color'] || fallbackColor(name),
              action: false,
              parts: text ? expandThirdParty(buildParts(text, tags['emotes'] ?? '')) : [],
              at: Date.now(),
              kind: 'sub',
              headline,
            }

            setMessages((prev) => [...prev, msg].slice(-max))
          }
        }
      },
    })
  }, [])

  // Expire old messages
  useEffect(() => {
    if (!ttl) return
    const t = setInterval(() => {
      const cutoff = Date.now() - ttl
      setMessages((prev) =>
        prev.some((m) => m.at < cutoff) ? prev.filter((m) => m.at >= cutoff) : prev,
      )
    }, 1000)
    return () => clearInterval(t)
  }, [])

  return messages
}
