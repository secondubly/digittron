import type { Msg } from '../types';

export function Message({ msg }: { msg: Msg }) {
  const badges = msg.badges?.length > 0 && (
    <span className="badges">
      {msg.badges.map((b) => (
        <img key={b.url} className="badge" src={b.url} alt={b.title} title={b.title} />
      ))}
    </span>
  )

  const body = msg.parts.map((p, i) =>
    typeof p === 'string' ? (
      <span key={i}>{p}</span>
    ) : (
      <img key={i} className="emote" alt={p.alt} src={p.src} />
    ),
  );

  const style = { ['--c' as string]: msg.color };

  if (msg.kind === 'chat') {
    return (
      <div className={`msg${msg.action ? ' action' : ''}`} style={{ ['--c' as string]: msg.color }}>
        {msg.action ? null : badges} <span className="name">{msg.action ? `${msg.name}` : `<${msg.name}>`}</span>
        <span className="text">{body}</span>
      </div>
    );
  }

  return (
    <div className={`msg special ${msg.kind}`} style={style}>
      <div>
        <div className="headline" style={{display: 'inline' }}>
          <span className="name">{msg.name}</span> {msg.headline}
        </div>
        {body.length > 0 && <span className="text">: {body}</span>}
      </div>
    </div>
  );
}
