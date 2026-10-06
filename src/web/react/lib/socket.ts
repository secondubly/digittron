type Handlers = {
  onOpen?: (ws: WebSocket) => void
  onMessage: (data: string, ws: WebSocket) => void
  onClose?: (byCleanup: boolean) => void
}

// WebSocket with exponential-backoff reconnect. Returns a cleanup function.
export function openSocket(url: string, h: Handlers): () => void {
  let ws: WebSocket
  let timer: number
  let attempts = 0
  let closed = false

  const connect = () => {
    ws = new WebSocket(url)
    ws.onopen = () => {
      attempts = 0
      h.onOpen?.(ws)
    }
    ws.onmessage = (ev) => h.onMessage(String(ev.data), ws)
    ws.onclose = () => {
      h.onClose?.(closed)
      if (!closed) timer = window.setTimeout(connect, Math.min(1000 * 2 ** attempts++, 15000))
    }
  }

  connect()
  return () => {
    closed = true
    clearTimeout(timer)
    // Closing mid-handshake logs a browser warning, so wait for open first
    if (ws.readyState === WebSocket.CONNECTING) ws.onopen = () => ws.close()
    else ws.close()
  }
}
