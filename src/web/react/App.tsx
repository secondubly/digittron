import { Message } from './components/Message';
import { useAlerts } from './hooks/useAlerts';
import { useChat } from './hooks/useChat';

export function App() {
  const messages = useChat();
  useAlerts();

  return (
    <div className="chat">
      {messages.map((m) => (
        <Message key={m.id} msg={m} />
      ))}
    </div>
  );
}
