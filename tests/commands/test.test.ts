import { describe, it, expect, vi } from 'vitest'
import type { CommandContext } from '../../src/bot/types.js'
import testCommand from '../../src/bot/commands/test.js'

function makeContext(overrides?: Partial<CommandContext>): CommandContext {
  return {
    client: {} as CommandContext['client'],
    channel: '#testchannel',
    msg: {} as CommandContext['msg'],
    args: [],
    rawMsg: '!test',
    say: vi.fn<(message: string) => Promise<void>>(),
    ...overrides,
  }
}

describe('!test command', () => {
  it('calls say with the expected message', async () => {
    const ctx = makeContext()

    await testCommand.execute(ctx)

    expect(ctx.say).toHaveBeenCalledOnce()
    expect(ctx.say).toHaveBeenCalledWith('This is a test of the emergency bot system! 🚨')
  })

  it('has the correct name', () => {
    expect(testCommand.name).toBe('test')
  })

  it('includes test in its aliases', () => {
    expect(testCommand.aliases).toContain('test')
  })
})
