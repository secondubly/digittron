import type { EventSubEvent, EventDeps } from '../types'

export default ({ registry }: EventDeps): EventSubEvent => ({
    type: 'eventsub',
    name: 'onChatMessage',
    register({ eventSub, apiClient, broadcasterId, botUserId }) {
        eventSub.onChannelChatMessage(broadcasterId, botUserId, (event) => {
            registry.dispatch(event, apiClient)
        })
    },
})
