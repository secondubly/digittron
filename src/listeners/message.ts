import type { ChatUserstate } from "tmi.js";

export function onMessage(channel: string, state: ChatUserstate, message: string, self: boolean) {
    if (self) return
    // TODO: command handler
}