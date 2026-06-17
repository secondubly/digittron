// import { vi } from 'vitest'
// import { EventSubChannelChatMessageEvent } from '@twurple/eventsub-base'
// import { CommandContext, CommandDeps } from '../../src/lib/bot/types.js'
// import { TokenRecord } from '../../src/lib/core/tokens/types.js'
// // ── Mock deps ─────────────────────────────────────────────────────────────────

// export function mockDeps(overrides: Partial<CommandDeps> = {}): CommandDeps {
//     return {
//         tokenStore: {
//             get: vi.fn(),
//             set: vi.fn(),
//             delete: vi.fn(),
//         },
//         registry: {
//             dispatch: vi.fn(),
//             register: vi.fn(),
//         },
//         apiClient: {
//             streams: { getStreamByUserId: vi.fn() },
//             moderation: { banUser: vi.fn(), deleteChatMessages: vi.fn() },
//             chat: { sendChatMessage: vi.fn() },
//             channels: { getChannelInfoById: vi.fn() },
//             users: { getUserByName: vi.fn() },
//         },
//         ...overrides,
//     } as unknown as CommandDeps
// }

// // ── Mock context ──────────────────────────────────────────────────────────────

// export function mockContext(
//     overrides: Partial<CommandContext> = {},
// ): CommandContext {
//     return {
//         client: mockApiClient(),
//         channel: '#testchannel',
//         msg: mockMessage(),
//         args: [],
//         rawMessage: '!command',
//         ...overrides,
//     }
// }

// // ── Mock message ──────────────────────────────────────────────────────────────

// export function mockMessage(
//     overrides: Partial<EventSubChannelChatMessageEvent> = {},
// ): EventSubChannelChatMessageEvent {
//     return {
//         messageId: 'msg-123',
//         messageText: '!command',
//         chatterId: 'user-123',
//         chatterName: 'testuser',
//         chatterDisplayName: 'TestUser',
//         broadcasterId: 'broadcaster-456',
//         broadcasterName: 'testchannel',
//         broadcasterDisplayName: 'TestChannel',
//         badges: [],
//         bits: 0,
//         ...overrides,
//     } as unknown as EventSubChannelChatMessageEvent
// }

// // ── Mock token ────────────────────────────────────────────────────────────────

// export function mockToken(overrides: Partial<TokenRecord> = {}): TokenRecord {
//     return {
//         accessToken: 'test-access-token',
//         refreshToken: 'test-refresh-token',
//         expiresIn: 3600,
//         obtainedAt: Date.now(),
//         scope: 'channel:read:ads chat:edit',
//         ...overrides,
//     }
// }

// // ── Mock API client ───────────────────────────────────────────────────────────

// export function mockApiClient() {
//     return {
//         say: vi.fn().mockResolvedValue(undefined),
//         channels: { getChannelInfoById: vi.fn() },
//         users: { getUserByName: vi.fn() },
//         chat: { sendChatMessage: vi.fn() },
//     }
// }

// // ── Mock moderator message ────────────────────────────────────────────────────

// export function mockModMessage(
//     overrides: Partial<EventSubChannelChatMessageEvent> = {},
// ): EventSubChannelChatMessageEvent {
//     return mockMessage({
//         badges: ['moderator'],
//         ...overrides,
//     })
// }

// // ── Mock broadcaster message ──────────────────────────────────────────────────

// export function mockBroadcasterMessage(
//     overrides: Partial<EventSubChannelChatMessageEvent> = {},
// ): EventSubChannelChatMessageEvent {
//     return mockMessage({
//         chatterId: 'broadcaster-456', // matches broadcasterId
//         badges: [{ id: 'broadcaster', info: '' }],
//         ...overrides,
//     })
// }
