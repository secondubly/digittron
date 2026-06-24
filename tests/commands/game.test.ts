import { describe, it, expect, vi } from 'vitest'
import type { CommandContext } from '../../src/bot/types.js'
import gameCommand from '../../src/bot/commands/game.js'

const BROADCASTER_ID = 'broadcaster-123'
const MOD_ID = 'mod-456'
const VIEWER_ID = 'viewer-789'

function makeMsg({
  chatterId = VIEWER_ID,
  chatterDisplayName = 'ViewerUser',
  badges = {},
}: {
  chatterId?: string
  chatterDisplayName?: string
  badges?: Record<string, string>
} = {}): CommandContext['msg'] {
  return {
    broadcasterId: BROADCASTER_ID,
    chatterId,
    chatterDisplayName,
    badges,
  } as unknown as CommandContext['msg']
}

function makeClient({
  gameName = 'Current Game',
  games = [{ id: 'game-001' }],
  channelInfoNull = false,
}: {
  gameName?: string
  games?: { id: string }[]
  channelInfoNull?: boolean
} = {}): CommandContext['client'] {
  return {
    channels: {
      getChannelInfoById: vi.fn().mockResolvedValue(channelInfoNull ? null : { gameName }),
      updateChannelInfo: vi.fn().mockResolvedValue(undefined),
    },
    games: {
      getGamesByNames: vi.fn().mockResolvedValue(games),
    },
  } as unknown as CommandContext['client']
}

function makeContext(overrides?: Partial<CommandContext>): CommandContext {
  return {
    client: makeClient(),
    channel: '#testchannel',
    msg: makeMsg(),
    args: [],
    rawMsg: '!game',
    say: vi.fn<(message: string) => Promise<void>>(),
    ...overrides,
  }
}

describe('!game command', () => {
  describe('metadata', () => {
    it('has the correct name', () => {
      expect(gameCommand.name).toBe('game')
    })
  })

  describe('no args — show current game', () => {
    it('fetches and displays the current game', async () => {
      const client = makeClient({ gameName: 'Hollow Knight' })
      const ctx = makeContext({ client, msg: makeMsg({ chatterDisplayName: 'ViewerUser' }) })

      await gameCommand.execute(ctx)

      expect(client.channels.getChannelInfoById).toHaveBeenCalledWith(BROADCASTER_ID)
      expect(ctx.say).toHaveBeenCalledWith('@ViewerUser, current game: Hollow Knight')
    })

    it('does nothing if channel info is unavailable', async () => {
      const client = makeClient({ channelInfoNull: true })
      const ctx = makeContext({ client })

      await gameCommand.execute(ctx)

      expect(ctx.say).not.toHaveBeenCalled()
    })
  })

  describe('with args — update game', () => {
    it('updates the game when the chatter is a mod', async () => {
      const client = makeClient({ games: [{ id: 'game-001' }] })
      const ctx = makeContext({
        client,
        msg: makeMsg({
          chatterId: MOD_ID,
          chatterDisplayName: 'ModUser',
          badges: { moderator: '1' },
        }),
        args: ['Hollow', 'Knight'],
        rawMsg: '!game Hollow Knight',
      })

      await gameCommand.execute(ctx)

      expect(client.games.getGamesByNames).toHaveBeenCalledWith(['Hollow Knight'])
      expect(client.channels.updateChannelInfo).toHaveBeenCalledWith(BROADCASTER_ID, {
        gameId: 'game-001',
      })
      expect(ctx.say).toHaveBeenCalledWith('Successfully updated game to Hollow Knight.')
    })

    it('updates the game when the chatter is the broadcaster', async () => {
      const client = makeClient({ games: [{ id: 'game-002' }] })
      const ctx = makeContext({
        client,
        msg: makeMsg({ chatterId: BROADCASTER_ID, chatterDisplayName: 'BroadcasterUser' }),
        args: ['Celeste'],
        rawMsg: '!game Celeste',
      })

      await gameCommand.execute(ctx)

      expect(client.channels.updateChannelInfo).toHaveBeenCalledWith(BROADCASTER_ID, {
        gameId: 'game-002',
      })
      expect(ctx.say).toHaveBeenCalledWith('Successfully updated game to Celeste.')
    })

    it('does nothing when the chatter is not a mod or broadcaster', async () => {
      const client = makeClient()
      const ctx = makeContext({
        client,
        msg: makeMsg({ chatterId: VIEWER_ID, badges: {} }),
        args: ['Some', 'Game'],
        rawMsg: '!game Some Game',
      })

      await gameCommand.execute(ctx)

      expect(client.games.getGamesByNames).not.toHaveBeenCalled()
      expect(client.channels.updateChannelInfo).not.toHaveBeenCalled()
      expect(ctx.say).not.toHaveBeenCalled()
    })

    it('notifies the user when no game is found', async () => {
      const client = makeClient({ games: [] })
      const ctx = makeContext({
        client,
        msg: makeMsg({
          chatterId: MOD_ID,
          chatterDisplayName: 'ModUser',
          badges: { moderator: '1' },
        }),
        args: ['Nonexistent', 'Game'],
        rawMsg: '!game Nonexistent Game',
      })

      await gameCommand.execute(ctx)

      expect(client.channels.updateChannelInfo).not.toHaveBeenCalled()
      expect(ctx.say).toHaveBeenCalledWith(
        '@ModUser could not find any games with that title. Please check your input and try again.',
      )
    })
  })
})
