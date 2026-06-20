import { Stack, TextInput, Text,
         Button, Group, Paper,
         ActionIcon, Slider,
         FileButton, Badge }      from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconTrash,
         IconUpload,
         IconPlayerPlay }         from '@tabler/icons-react';
import { useCustomAudio }         from '../../hooks/useCustomAudio';

interface CustomAudioManagerProps {
  customAudio: ReturnType<typeof useCustomAudio>;
}

export function CustomAudioManager({ customAudio }: CustomAudioManagerProps) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      chatterId: '',
      chatterName: '',
      audioUrl: '',
      audioFile: null as File | null
    },
    validate: {
      audioFile: (value) => (value === null ? 'Audio file is required' : null),
    }
  })

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    // create object URL for local file
    const url = URL.createObjectURL(file);
    form.setFieldValue('audioUrl', url);
    form.setFieldValue('audioFile', file)
  };

  const handleAdd = async (values: typeof form.values) => {
    const { chatterId, audioUrl, chatterName, audioFile } = values
    if (!chatterId || !audioUrl) return;

    customAudio.addEntry({
      chatterId,
      chatterName: chatterName || chatterId,
      audioUrl,
    });

    const formData = new FormData()
    formData.append('chatterId', chatterId)
    formData.append('chatterName', chatterName)
    
    if (audioFile) {
      formData.append('audioUrl', audioUrl)
      formData.append('audioFile', audioFile, audioFile.name)
    }

    try {
      const res = await fetch('http://localhost:4000/api/audio/alerts', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Upload failed', text)
        return
      }

      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
          const data = await res.text();
          console.log("Response object", res)
          console.log('raw response: ', data);
      }
    } catch (err) {
      console.log(err)
      console.log('Error', err)
    }
  };

  return (
    <Paper p="md" radius="md" bg="dark.8">
      <Stack gap="md">

        <Text fw={600} c="white">Custom Entry Sounds</Text>
        
        <form onSubmit={form.onSubmit(handleAdd)}>
          <Stack gap="xs">
            <TextInput
              placeholder="Twitch user ID"
              label="Chatter ID"
              ff="monospace"
              key={form.key('chatterId')}
              {...form.getInputProps('chatterId')}
            />
            <TextInput
              placeholder="Display name (optional)"
              label="Chatter Name"
              key={form.key('chatterName')}
              {...form.getInputProps('chatterName')}
            />
            <TextInput
              placeholder="https://... or upload below"
              label="Audio URL"
              ff="monospace"
              key={form.key('audioUrl')}
              {...form.getInputProps('audioUrl')}
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
                type='submit'
                color="violet"
                size="xs"
                disabled={!form.values.chatterId || !form.values.audioUrl}
              >
                Add
              </Button>
            </Group>
          </Stack>
        </form>

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