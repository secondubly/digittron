import { Message } from "./components/Message"
import { channel } from "./config"
import { useAlerts } from "./hooks/useAlerts"
import { useChat } from "./hooks/useChat"

export function App() {
    const messages = useChat()
    useAlerts()

    if (!channel) {
        return (
            <div className="chat">
                <div className="msg">Add ?channel=yourchannel to the URL.</div>
            </div>
        )
    }
    return (
        <div className="chat">
            {messages.map((m) => (
                <Message key={m.id} msg={m} />
            ))}
        </div>
    )
}
