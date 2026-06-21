// import { useCallback, useState } from "react";
// import { useBotAudio } from '../hooks/useBotAudio'
// import { useSSE } from '../hooks/useSSE'
// import { CustomAudioManager } from "../components/custom_audio_manager/CustomAudioManager";
// import { Stack, Switch } from "@mantine/core";

// export function OverlayPage() {
// const [muted, setMuted] = useState(false);

//   const {
//     playFirstMessage,
//     customAudio,
//   } = useBotAudio({
//     muted,
//   });

//   useSSE({
//     handlers: {
//       firstMessage:  useCallback((data) => playFirstMessage(data), [playFirstMessage]),
//     },
//   });

//   return (
//     <Stack p="xl" gap="lg">

//       {/* Global mute toggle */}
//       <Switch
//         label="Mute all sounds"
//         checked={muted}
//         onChange={e => setMuted(e.currentTarget.checked)}
//         color="violet"
//       />

//       {/* Per-user audio management */}
//       <CustomAudioManager customAudio={customAudio} />

//     </Stack>
//   );
// }

import { useCallback } from 'react'
import { useSSE } from '../hooks/useSSE'
import { useCustomAudio } from '../hooks/useCustomAudio'

interface FirstMessageEvent {
  chatterId: string
  chatterName: string
  message: string
  timestamp: string
}

export function OverlayPage() {
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
  return null
}
