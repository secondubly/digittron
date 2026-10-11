export type Fragment =
    | { type: 'text'; text: string } // plain text and @mentions
    | { type: 'emote'; text: string; id: string }
    | { type: 'cheermote'; text: string; prefix: string; tier: number }

export type ChatEvent =
    | {
          type: 'chat'
          id: string
          channel: string // channel login the message came from
          login: string // sender's login name (used for the overlay's `hide` list)
          userId: string
          name: string // display name
          color: string // '' if the user has no color set
          text: string // plain text, used for the "!command" filter
          fragments: Fragment[]
          roomId: string // channel id, used to load 7TV / BTTV emotes
          kind: 'chat' | 'cheer' | 'sub'
          headline?: string // e.g. "cheered 500 bits"
      }
    | { type: 'chat-remove'; id: string } // one message deleted by a mod
    | { type: 'chat-clear'; userId?: string } // chat cleared, or one user's messages purged
