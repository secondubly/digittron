import type { Msg } from '../types';

export function Message({ msg }: { msg: Msg }) {
  const body = msg.parts.map((p, i) =>
    typeof p === 'string' ? (
      <span key={i}>{p}</span>
    ) : (
      <img key={i} className="emote" alt={p.alt} src={p.src} />
    ),
  );

  const style = { ['--c' as string]: msg.color }

  if (msg.kind === 'chat') {
      return (
    <div className={`msg${msg.action ? ' action' : ''}`} style={{ ['--c' as string]: msg.color }}>
      <span className="name">{msg.name}</span>
      <span className="text">{body}</span>
    </div>
  );
  }

  return (
    <div className={`msg special ${msg.kind}`} style={style}>
      <div className="headline">
        <span className="name">{msg.name}</span> {msg.headline}
      </div>
      {body.length > 0 && <div className="text">{body}</div>}
    </div>
  )
}
