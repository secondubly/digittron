import type { HandlersList } from "arcscord";
import { commands } from './commands'
import { messageHoneypotEvent } from "./events/honeypot";
import { clientReady } from "./events/client_ready";

export default {
    events: [clientReady, messageHoneypotEvent],
    commands,
} satisfies HandlersList