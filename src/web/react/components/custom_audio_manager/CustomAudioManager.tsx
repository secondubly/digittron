import { useState }               from 'react';
import { Stack, TextInput, Text,
         Button, Group, Paper,
         ActionIcon, Slider,
         FileButton, Badge }      from '@mantine/core';
import { IconTrash,
         IconUpload,
         IconPlayerPlay }         from '@tabler/icons-react';
import { useCustomAudio }         from '../../hooks/useCustomAudio';

interface CustomAudioManagerProps {
  customAudio: ReturnType<typeof useCustomAudio>;
}

export function CustomAudioManager({ customAudio }: CustomAudioManagerProps) {
  const [chatterId,   setChatterId]   = useState('');
  const [chatterName, setChatterName] = useState('');
  const [audioUrl,    setAudioUrl]    = useState('');

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    // create object URL for local file
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const handleAdd = () => {
    if (!chatterId || !audioUrl) return;

    customAudio.addEntry({
      chatterId,
      chatterName: chatterName || chatterId,
      audioUrl,
    });

    setChatterId('');
    setChatterName('');
    setAudioUrl('');
  };

  return (
    <Paper p="md" radius="md" bg="dark.8">
      <Stack gap="md">

        <Text fw={600} c="white">Custom Entry Sounds</Text>

        {/* Add new entry */}
        <Stack gap="xs">
          <TextInput
            placeholder="Twitch user ID"
            label="Chatter ID"
            value={chatterId}
            onChange={e => setChatterId(e.currentTarget.value)}
            ff="monospace"
          />
          <TextInput
            placeholder="Display name (optional)"
            label="Chatter Name"
            value={chatterName}
            onChange={e => setChatterName(e.currentTarget.value)}
          />
          <TextInput
            placeholder="https://... or upload below"
            label="Audio URL"
            value={audioUrl}
            onChange={e => setAudioUrl(e.currentTarget.value)}
            ff="monospace"
          />
          <Group>
            <FileButton onChange={handleFileUpload} accept="audio/*">
              {(props) => (
                <Button
                  {...props}
                  variant="outline"
                  color="violet"
                  leftSection={<IconUpload size={14} />}
                  size="xs"
                >
                  Upload file
                </Button>
              )}
            </FileButton>
            <Button
              color="violet"
              size="xs"
              onClick={handleAdd}
              disabled={!chatterId || !audioUrl}
            >
              Add
            </Button>
          </Group>
        </Stack>

        {/* Entry list */}
        {[...customAudio.entries.values()].map(entry => (
          <Paper key={entry.chatterId} p="sm" radius="md" bg="dark.7">
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <Text fw={600} c="white" size="sm">{entry.chatterName}</Text>
                <Badge variant="outline" color="dark" size="xs" ff="monospace">
                  {entry.chatterId}
                </Badge>
              </Group>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  color="green"
                  size="sm"
                  onClick={() => customAudio.playForChatter(entry.chatterId)}
                >
                  <IconPlayerPlay size={14} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => customAudio.removeEntry(entry.chatterId)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            </Group>

            {/* Per-user volume */}
            <Slider
              value={entry.volume ?? 0.5}
              onChange={v => customAudio.updateVolume(entry.chatterId, v)}
              min={0}
              max={1}
              step={0.05}
              size="xs"
              color="violet"
              label={v => `${Math.round(v * 100)}%`}
            />
          </Paper>
        ))}

        {customAudio.entries.size === 0 && (
          <Text size="sm" c="dimmed" ta="center">
            No custom sounds added yet
          </Text>
        )}

      </Stack>
    </Paper>
  );
}