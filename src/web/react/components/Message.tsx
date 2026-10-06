import type { Msg } from '../types';

export function Message({ msg }: { msg: Msg }) {
  const body = msg.parts.map((p, i) =>
    typeof p === 'string' ? (
      <span key={i}>{p}</span>
    ) : (
      <img key={i} className="emote" alt={p.alt} src={p.src} />
    ),
  );
  return (
    <div className={`msg${msg.action ? ' action' : ''}`} style={{ ['--c' as string]: msg.color }}>
      <span className="name">{msg.name}</span>
      <span className="text">{body}</span>
    </div>
  );
}
