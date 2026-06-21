import { useState }               from 'react';
import { Stack, TextInput, Text,
         Button, Group, Paper,
         ActionIcon, Slider,
         FileButton, Badge,
         Switch, Loader }         from '@mantine/core';
import { IconTrash,
         IconUpload,
         IconPlayerPlay }         from '@tabler/icons-react';
import { useCustomAudio }         from '../../hooks/useCustomAudio';

interface CustomAudioManagerProps {
  customAudio: ReturnType<typeof useCustomAudio>;
}

export function CustomAudioManager({ customAudio }: CustomAudioManagerProps) {
  const {
    alerts,
    loading,
    addEntry,
    removeEntry,
    updateVolume,
    toggleEnabled,
    playForChatter,
  } = customAudio;

  const [chatterId, setChatterId] = useState('');
  const [chatterName, setChatterName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAdd = async () => {
    if (!chatterId || !file) return;

    setUploading(true);
    try {
      await addEntry(file, chatterId, chatterName || chatterId);
      setChatterId('');
      setChatterName('');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Paper p="md" radius="md" bg="dark.8">
        <Group justify="center">
          <Loader color="violet" size="sm" />
          <Text size="sm" c="dimmed">Loading audio alerts...</Text>
        </Group>
      </Paper>
    );
  }

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

          <Group align="flex-end">
            <FileButton onChange={setFile} accept="audio/*">
              {(props) => (
                <Button
                  {...props}
                  variant="outline"
                  color="violet"
                  leftSection={<IconUpload size={14} />}
                  size="xs"
                >
                  {file ? file.name : 'Choose file'}
                </Button>
              )}
            </FileButton>

            <Button
              color="violet"
              size="xs"
              loading={uploading}
              disabled={!chatterId || !file}
              onClick={handleAdd}
            >
              Upload &amp; Save
            </Button>
          </Group>
        </Stack>

        {/* Alert list — loaded from DB */}
        {alerts.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center">
            No custom sounds added yet
          </Text>
        ) : alerts.map(alert => (
          <Paper key={alert.id} p="sm" radius="md" bg="dark.7">
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <Text fw={600} c="white" size="sm">
                  {alert.chatterName}
                </Text>
                <Badge
                  variant="outline"
                  color="dark"
                  size="xs"
                  ff="monospace"
                >
                  {alert.chatterId}
                </Badge>
                <Badge
                  variant="light"
                  color="dimmed"
                  size="xs"
                  ff="monospace"
                >
                  {alert.filename}
                </Badge>
              </Group>

              <Group gap="xs">
                {/* Preview */}
                <ActionIcon
                  variant="subtle"
                  color="green"
                  size="sm"
                  onClick={() => playForChatter(alert.chatterId)}
                >
                  <IconPlayerPlay size={14} />
                </ActionIcon>

                {/* Delete */}
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => removeEntry(alert.id, alert.chatterId)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            </Group>

            {/* Volume */}
            <Slider
              value={alert.volume}
              onChange={v => updateVolume(alert.id, alert.chatterId, v)}
              min={0}
              max={1}
              step={0.05}
              size="xs"
              color="violet"
              label={v => `${Math.round(v * 100)}%`}
              mb="xs"
            />

            {/* Enable/disable */}
            <Switch
              label="Enabled"
              size="xs"
              checked={alert.enabled}
              onChange={e => toggleEnabled(alert.id, e.currentTarget.checked)}
              color="violet"
            />
          </Paper>
        ))}

      </Stack>
    </Paper>
  );
}