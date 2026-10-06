/**
 * Query params (all read once at load):
 *   channel  (required) channel to read
 *   ttl      seconds before a message fades out, 0 = never (default 30)
 *   max      max messages on screen (default 12)
 *   size     font size in px (default 22)
 *   hide     comma-separated usernames to ignore (your bots)
 *   emotes   third-party emote providers, default "7tv,bttv" ("none" to disable)
 *   alerts   bot alert server, default ws://localhost:3001 ("off" to disable)
 *   volume   alert volume from 0 to 1 (default 0.6)
 *   debug    log connection state and raw lines to the console
 * Messages starting with "!" are hidden so command spam stays off stream.
 */
const params = new URLSearchParams(location.search)

export const channel = (params.get('channel') ?? '').toLowerCase()
export const ttl = Number(params.get('ttl') ?? 30) * 1000
export const max = Number(params.get('max') ?? 12)
export const size = Number(params.get('size') ?? 22)
export const hide = new Set((params.get('hide') ?? '').toLowerCase().split(',').filter(Boolean))
export const debug = params.has('debug')

export const emoteProviders = new Set((params.get('emotes') ?? '7tv,bttv').toLowerCase().split(','))

export const alertsUrl = params.get('alerts') ?? 'ws://localhost:3000'
export const alertsHttp = alertsUrl.replace(/^ws/, 'http') // sounds are served by the same server
export const volume = Math.min(1, Math.max(0, Number(params.get('volume') ?? 0.6)))
