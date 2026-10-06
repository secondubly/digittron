export type Alert = { type: 'first-message'; name: string; sound: string }

export const sendAlert = async (alert: Alert, port: string) => {
  // the bot is running via a different process so we need to have a way for it to
  // connect to the server, we can't access it directly
  try {
    const response = await fetch(`http://localhost:${port}/api/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    })
    if (!response.ok) {
      console.error(`Failed to send alert. Server status: ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to connect to the alert server from the bot process:', error)
  }
}
