import { Message } from './components/Message';
import { useAlerts } from './hooks/useAlerts';
import { useChat } from './hooks/useChat';

export function App() {
  const messages = useChat();
  useAlerts();

  return (
    <div className="chat">
      <div className="container">
        <div className="titlebar">
          <div className="traffic-lights">
            <span className={`traffic-light red`}></span>
            <span className={`traffic-light yellow`}></span>
            <span className={`traffic-light green`}></span>
          </div>
          <div className="window-title">
            <strong>#secondubly</strong> – chat
          </div>
        </div>
        <div className="messages">
          {messages.map((m) => (
            <Message key={m.id} msg={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
