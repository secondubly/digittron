import type { ApiClient } from '@twurple/api'
import { command, hasLevel, type PermissionLevel } from '../services/permissions'
import { addQuote, deleteQuote, getQuote, getRandomQuote, searchQuote } from '../services/quotes'
import type { Quote } from '../../../api/types'

//  Command to get quotes, available options:
//   !quote                          a random quote
//   !quote 12                       quote #12
//   !quote search <text>            a random quote containing <text>
//   !quote add <text> [- <author>]  add a quote (ADD_LEVEL and up)
//   !quote delete <number>          remove a quote (DELETE_LEVEL and up)

const ADD_LEVEL: PermissionLevel = 'everyone'
const DELETE_LEVEL: PermissionLevel = 'mod'

const MAX_TEXT = 500
const MAX_AUTHOR = 50

// "12" or "#12" -> 12, anything else -> null
const parseId = (s: string | undefined) =>
  s && /^#?\d+$/.test(s) ? Number(s.replace('#', '')) : null

// "text - author": split on the last standalone dash. A hyphen inside a word is left alone.
function splitAuthor(raw: string): { text: string; author?: string } {
  const match = /^(.*\S)\s+[-–—]\s+(\S.*)$/s.exec(raw)
  if (!match) return { text: raw }
  return { text: match[1] ?? raw, author: (match[2] ?? '').trim().slice(0, MAX_AUTHOR) }
}

// "\"never trust a shortcut\"" -> "never trust a shortcut"
const stripQuotes = (text: string) => text.replace(/^["“”](.*)["“”]$/s, '$1').trim()

async function currentGame(api: ApiClient, channelId: string | null): Promise<string | undefined> {
  if (!channelId) return undefined
  try {
    return (await api.channels.getChannelInfoById(channelId))?.gameName || undefined
  } catch {
    return undefined // the quote is still worth saving without a game
  }
}

/** e.g. `#12: "Never trust a shortcut" - Streamer, Elden Ring (2026-10-07)` */
function formatQuote(q: Quote): string {
  const date = new Date(q.createdAt).toISOString().slice(0, 10)
  const who = q.author ? ` - ${q.author}` : ''
  const game = q.game ? `, ${q.game}` : ''
  return `#${q.id}: "${q.text}"${who}${game} (${date})`
}

export default function quoteCommand({ api }: { api: ApiClient }) {
  return command(
    'quote',
    'everyone',
    async (params, ctx) => {
      const userInfo = ctx.msg.userInfo
      const [first = '', ...rest] = params
      const sub = first.toLowerCase()
      const say = async (text: string) => {
        await ctx.reply(text)
      }

      if (!sub) {
        const quote = await getRandomQuote()
        return say(quote ? formatQuote(quote) : 'There are no quotes yet.')
      }

      const number = parseId(first)
      if (number !== null) {
        const quote = await getQuote(number)
        return say(quote ? formatQuote(quote) : `There is no quote #${number}.`)
      }

      if (sub === 'search') {
        const term = rest.join(' ').trim()
        if (!term) return say('Usage: !quote search <text>')
        const quote = await searchQuote(term)
        // the search term isn't repeated back, so the bot can't be made to say what a viewer typed
        return say(quote ? formatQuote(quote) : 'No quotes match that.')
      } else if (sub === 'add') {
        if (!hasLevel(userInfo, ADD_LEVEL)) return say('You are not allowed to add quotes.')

        const { text, author } = splitAuthor(rest.join(' ').trim())
        const clean = stripQuotes(text)
        if (!clean) return say('Usage: !quote add <text> - <author>')
        if (clean.length > MAX_TEXT)
          return say(`That quote is too long (max ${MAX_TEXT} characters).`)

        const game = await currentGame(api, ctx.broadcasterId)
        try {
          const id = await addQuote({
            text: clean,
            ...(author ? { author } : {}),
            ...(game ? { game } : {}),
            addedByUserId: ctx.userId ?? '',
            addedByName: ctx.userDisplayName,
          })

          if (!id || id.error) {
            return say('Could not save that quote.')
          }

          return say(`Added quote #${id}.`)
        } catch {
          return say('Could not save that quote.')
        }
      } else if (sub === 'delete' || sub === 'del' || sub === 'remove') {
        // !quote delete <number>
        if (!hasLevel(userInfo, DELETE_LEVEL)) return say('You are not allowed to delete quotes.')

        const target = parseId(rest[0])
        if (target === null) return say('Usage: !quote delete <number>')
        return say(
          (await deleteQuote(target))
            ? `Deleted quote #${target}.`
            : `There is no quote #${target}.`,
        )
      }

      return say(
        'Usage: !quote [number] | !quote search <text> | !quote add <text> - <author> | !quote delete <number>',
      )
    },
    { userCooldown: 5, aliases: ['quotes'] },
  )
}
