import { useState } from 'react';
import { Button, Text, Stack,
         Paper, Divider, Group,
         ThemeIcon, Box, Skeleton } from '@mantine/core';
import { IconBrandSpotify,
         IconCheck } from '@tabler/icons-react';
import { useScopes } from '../../hooks/useScopes';
import classes from './SpotifyAuthButton.module.css';

interface SpotifyAuthButtonProps {
  onAuth?: () => void;
}

export function SpotifyAuthButton({ onAuth }: SpotifyAuthButtonProps) {
  const { scopes, loading: scopesLoading } = useScopes();
  const [authLoading, setAuthLoading]      = useState(false);
  const [success,     setSuccess]          = useState(false);

  const scopeList = scopes?.spotify ?? [];

  const handleAuth = async () => {
    setAuthLoading(true);
    try {
      await onAuth?.();
      setSuccess(true);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <Paper p="xl" radius="xl" className={classes.card}>
      <Stack align="center" gap="lg">

        {/* Icon + title */}
        <Stack align="center" gap="xs">
          <ThemeIcon size={64} radius="xl" color="green" className={classes.icon}>
            <IconBrandSpotify size={36} />
          </ThemeIcon>
          <Text fw={800} size="xl" c="white">Spotify</Text>
          <Text size="xs" c="dimmed" ff="monospace" tt="uppercase">
            Connect your account
          </Text>
        </Stack>

        {/* Permissions — fetched from /api/config/scopes */}
        <Stack w="100%" gap="xs">
          <Text size="xs" c="dimmed" ff="monospace" tt="uppercase">
            Permissions requested
          </Text>

          {scopesLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={36} radius="md" />
              ))
            : scopeList.map(scope => (
                <Group key={scope} gap="sm" p="sm" className={classes.permItem}>
                  <Box className={classes.permDot} />
                  <Text size="xs" ff="monospace" c="dimmed">{scope}</Text>
                </Group>
              ))
          }
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
            loading={authLoading}
            leftSection={<IconBrandSpotify size={18} />}
            className={classes.button}
            onClick={handleAuth}
          >
            Continue with Spotify
          </Button>
        )}

      </Stack>
    </Paper>
  );
}