import type { CommandRegistry } from '@lib/bot/CommandRegistry'
import type { ApiClient } from '@twurple/api'
import type { ChatClient } from '@twurple/chat'
import type { EventSubHttpListener } from '@twurple/eventsub-http'
import type { EventSubWsListener } from '@twurple/eventsub-ws'
import type { Bot } from '../bot'
import type { FirstMessageTracker } from '@lib/bot/FirstMessageTracker'

export interface EventDeps {
    registry: CommandRegistry
    bot: Bot
    apiClient: ApiClient
    firstMessageTracker: FirstMessageTracker
}

export interface BotContext {
    chatClient: ChatClient
    eventSub: EventSubWsListener | EventSubHttpListener
    broadcasterId: string
    botUserId: string
    firstMessageTracker: FirstMessageTracker
}

export interface ChatEvent {
    type: 'chat'
    name: string
    register: (ctx: BotContext) => void
}

export interface EventSubEvent {
    type: 'eventsub'
    name: string
    register: (ctx: BotContext) => void
}

export type BotEvent = ChatEvent | EventSubEvent
