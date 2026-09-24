import { useCallback, useEffect } from 'react'
import { useSSE } from '../hooks/useSSE'
import { useCustomAudio } from '../hooks/useCustomAudio'

interface FirstMessageEvent {
  chatterId: string
  chatterName: string
  message: string
  timestamp: string
}

export function OverlayPage() {
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = 'transparent';

    // Revert back to the original color when leaving the page
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const { playForChatter } = useCustomAudio('/audio/first-message.mp3')

  useSSE({
    handlers: {
      firstMessage: useCallback(
        async (event: FirstMessageEvent) => {
          await playForChatter(event.chatterId)
        },
        [playForChatter],
      ),
    },
  })

  // no UI — invisible overlay
  return (
    <title>secondubly - Overlay</title>
  )
}
