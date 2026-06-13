// components/TwitchAuthButton.tsx
import { Button, Text, Badge, Stack,
         Group, Paper, Divider, 
         Skeleton}    from '@mantine/core';
import { IconBrandTwitch } from '@tabler/icons-react';
import classes from './TwitchAuthButton.module.css';
import {useScopes} from '../../hooks/useScopes'

interface TwitchAuthButtonProps {
    redirect: () => void
}

export function TwitchAuthButton({
    redirect
}: TwitchAuthButtonProps) {
  const { scopes, loading } = useScopes();
  const scopeList = scopes?.twitch['bot'] ?? [];

  return (
    <Paper
      p="xl"
      radius="lg"
      className={classes.card}
    >
      <Stack align="center" gap="lg">

        {/* Header */}
        <Stack align="center" gap={6}>
          <Group gap={8}>
            <IconBrandTwitch size={26} color="var(--mantine-color-violet-5)" />
            <Text fw={800} size="xl">Twitch</Text>
          </Group>
          <Text size="xs" c="dimmed" tt="uppercase" ff="monospace">
            Connect your account
          </Text>
        </Stack>

        <Group gap={6} justify="center">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={20} width={100} radius="sm" />
              ))
            : scopeList.map(scope => (
                <Badge
                  key={scope}
                  variant="light"
                  color="violet"
                  size="sm"
                  ff="monospace"
                >
                  {scope}
                </Badge>
              ))
          }
        </Group>

        <Divider w="100%" color="dark.5" />

        {/* Auth button */}
        <Button
          fullWidth
          size="sm"
          radius="md"
          color="violet"
          loading={loading}
          leftSection={<IconBrandTwitch size={18} />}
          className={classes.button}
          onClick={redirect}
        >
        Connect Bot Account
        </Button>

        {/* Footer */}
        <Text size="xs" c="dimmed" ta="center" ff="monospace">
          By connecting you agree to Twitch's{' '}
          <Text component="a" href="#" size="xs" c="violet.4">
            Terms of Service
          </Text>
        </Text>

      </Stack>
    </Paper>
  );
}