// components/SpotifyAuthButton.tsx
import { useState }               from 'react';
import { Button, Text, Stack,
         Paper, Divider, Group,
         ThemeIcon, Box }         from '@mantine/core';
import { IconBrandSpotify,
         IconCheck }   from '@tabler/icons-react';
import classes                    from './SpotifyAuthButton.module.css';

const SPOTIFY_SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-read-recently-played',
  'user-top-read',
] as const;

interface SpotifyAuthButtonProps {
  scopes?:  readonly string[];
  onAuth?:  () => void;
}

export function SpotifyAuthButton({
  scopes  = SPOTIFY_SCOPES,
  onAuth,
}: SpotifyAuthButtonProps) {
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      await onAuth?.();
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="xl" radius="xl" className={classes.card}>
      <Stack align="center" gap="lg">

        {/* Icon + title */}
        <Stack align="center" gap="xs">
          <ThemeIcon
            size={64}
            radius="xl"
            color="green"
            className={classes.icon}
          >
            <IconBrandSpotify size={36} />
          </ThemeIcon>
          <Text fw={800} size="xl">Spotify</Text>
          <Text size="xs" c="dimmed" ff="monospace" tt="uppercase">
            Connect your account
          </Text>

          {/* Equalizer bars */}
          <Group gap={3} align="flex-end" h={20} className={classes.equalizer}>
            {[...Array(5)].map((_, i) => (
              <Box key={i} className={classes.eqBar} style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </Group>
        </Stack>

        {/* Permissions */}
        <Stack w="100%" gap="xs">
          <Text size="xs" c="dimmed" ff="monospace" tt="uppercase">
            Permissions requested
          </Text>
          {scopes.map(scope => (
            <Group
              key={scope}
              gap="sm"
              p="sm"
              className={classes.permItem}
            >
              <Box className={classes.permDot} />
              <Text size="xs" ff="monospace" c="dimmed">{scope}</Text>
            </Group>
          ))}
        </Stack>

        <Divider w="100%" color="dark.6" />

        {/* Button or success */}
        {success ? (
          <Stack align="center" gap="xs">
            <ThemeIcon size={56} radius="xl" color="green" variant="light">
              <IconCheck size={28} />
            </ThemeIcon>
            <Text fw={700} c="white">Connected</Text>
            <Text size="xs" c="dimmed" ff="monospace">Redirecting to dashboard...</Text>
          </Stack>
        ) : (
          <Button
            fullWidth
            size="md"
            radius="xl"
            color="green"
            loading={loading}
            leftSection={<IconBrandSpotify size={18} />}
            className={classes.button}
            onClick={handleAuth}
          >
            Continue with Spotify
          </Button>
        )}

        <Text size="xs" c="dimmed" ta="center" ff="monospace">
          By connecting you agree to Spotify's{' '}
          <Text component="a" href="#" size="xs" c="green.5">Terms of Service</Text>
          {' '}&amp;{' '}
          <Text component="a" href="#" size="xs" c="green.5">Privacy Policy</Text>
        </Text>

      </Stack>
    </Paper>
  );
}