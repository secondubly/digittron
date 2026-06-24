import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CommandContext } from '../../src/bot/types.js'
import titleCommand from '../../src/bot/commands/title.js'

const BROADCASTER_ID = 'broadcaster-123'
const BROADCASTER_TWITCH_ID = 'broadcaster-123'
const MOD_ID = 'mod-456'
const VIEWER_ID = 'viewer-789'

function makeMsg(chatterId: string, chatterDisplayName: string): CommandContext['msg'] {
  return {
    broadcasterId: BROADCASTER_ID,
    chatterId,
    chatterDisplayName,
  } as unknown as CommandContext['msg']
}

function makeClient({
  title = 'Current Stream Title',
  isMod = false,
}: {
  title?: string
  isMod?: boolean
} = {}): CommandContext['client'] {
  return {
    channels: {
      getChannelInfoById: vi.fn().mockResolvedValue({ title }),
      updateChannelInfo: vi.fn().mockResolvedValue(undefined),
    },
    moderation: {
      checkUserMod: vi.fn().mockResolvedValue(isMod),
    },
  } as unknown as CommandContext['client']
}

function makeContext(overrides?: Partial<CommandContext>): CommandContext {
  return {
    client: makeClient(),
    channel: '#testchannel',
    msg: makeMsg(VIEWER_ID, 'ViewerUser'),
    args: [],
    rawMsg: '!title',
    say: vi.fn<(message: string) => Promise<void>>(),
    ...overrides,
  }
}

beforeEach(() => {
  vi.stubEnv('TWITCH_ID', BROADCASTER_TWITCH_ID)
})

describe('!title command', () => {
  describe('metadata', () => {
    it('has the correct name', () => {
      expect(titleCommand.name).toBe('title')
    })
  })

  describe('no args — show title', () => {
    it('fetches and displays the current stream title', async () => {
      const client = makeClient({ title: 'My Cool Stream' })
      const ctx = makeContext({ client, msg: makeMsg(VIEWER_ID, 'ViewerUser') })

      await titleCommand.execute(ctx)

      expect(client.channels.getChannelInfoById).toHaveBeenCalledWith(BROADCASTER_ID)
      expect(ctx.say).toHaveBeenCalledWith('@ViewerUser, title: My Cool Stream')
    })

    it('does nothing if channel info is unavailable', async () => {
      const client = {
        channels: { getChannelInfoById: vi.fn().mockResolvedValue(null) },
      } as unknown as CommandContext['client']
      const ctx = makeContext({ client })

      await titleCommand.execute(ctx)

      expect(ctx.say).not.toHaveBeenCalled()
    })
  })

  describe('with args — update title', () => {
    it('updates the title when the chatter is a mod', async () => {
      const client = makeClient({ isMod: true })
      const ctx = makeContext({
        client,
        msg: makeMsg(MOD_ID, 'ModUser'),
        args: ['New', 'Stream', 'Title'],
        rawMsg: '!title New Stream Title',
      })

      await titleCommand.execute(ctx)

      expect(client.channels.updateChannelInfo).toHaveBeenCalledWith(BROADCASTER_ID, {
        title: 'New,Stream,Title',
      })
      expect(ctx.say).toHaveBeenCalledWith('@ModUser updated game title to: New,Stream,Title.')
    })

    it('updates the title when the chatter is the broadcaster', async () => {
      const client = makeClient({ isMod: false })
      const ctx = makeContext({
        client,
        msg: makeMsg(BROADCASTER_TWITCH_ID, 'BroadcasterUser'),
        args: ['Broadcaster', 'Title'],
        rawMsg: '!title Broadcaster Title',
      })

      await titleCommand.execute(ctx)

      expect(client.channels.updateChannelInfo).toHaveBeenCalledWith(BROADCASTER_ID, {
        title: 'Broadcaster,Title',
      })
      expect(ctx.say).toHaveBeenCalledWith(
        '@BroadcasterUser updated game title to: Broadcaster,Title.',
      )
    })

    it('does nothing when the chatter is not a mod or broadcaster', async () => {
      const client = makeClient({ isMod: false })
      const ctx = makeContext({
        client,
        msg: makeMsg(VIEWER_ID, 'ViewerUser'),
        args: ['Hacked', 'Title'],
        rawMsg: '!title Hacked Title',
      })

      await titleCommand.execute(ctx)

      expect(client.channels.updateChannelInfo).not.toHaveBeenCalled()
      expect(ctx.say).not.toHaveBeenCalled()
    })
  })
})
