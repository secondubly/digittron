import type { CommandRegistry } from '@lib/bot/CommandRegistry'
import type { ApiClient } from '@twurple/api'
import type { ChatClient } from '@twurple/chat'
import type { EventSubHttpListener } from '@twurple/eventsub-http'
import type { EventSubWsListener } from '@twurple/eventsub-ws'
import type { Bot } from '../bot'

export interface EventDeps {
    registry: CommandRegistry
    bot: Bot
    apiClient: ApiClient
}

export interface BotContext {
    chatClient: ChatClient
    eventSub: EventSubWsListener | EventSubHttpListener
    broadcasterId: string
    botUserId: string
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
