import { useCallback, useState } from "react";
import { useBotAudio } from '../hooks/useBotAudio'
import { useSSE } from '../hooks/useSSE'
import { CustomAudioManager } from "../components/custom_audio_manager/CustomAudioManager";
import { Stack } from "@mantine/core";

export function OverlayPage() {
  const [muted, setMuted] = useState(false);

  const { playFirstMessage, customAudio } = useBotAudio({
    muted,
    onFirstMessage: useCallback((event) => {
      console.log(`First message: ${event.chatterId} — ${event.chatterName}`);
    }, []),
  });

  useSSE({
    handlers: {
      firstMessage: useCallback((data) => playFirstMessage(data), [playFirstMessage]),
    },
  });

  return (
    <Stack p="xl" gap="lg">
      <CustomAudioManager customAudio={customAudio} />
    </Stack>
  );
}