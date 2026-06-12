// components/TwitchAuthButton.tsx
import { Button, Text, Badge, Stack,
         Group, Paper, Divider }    from '@mantine/core';
import { IconBrandTwitch }          from '@tabler/icons-react';
import classes                      from './TwitchAuthButton.module.css';

interface TwitchAuthButtonProps {
    redirect: () => void
    loading?: boolean
}

const BOT_SCOPES = [
  'channel:edit:commercial',
  'channel:moderate',
  'chat:read',
  'chat:edit',
  'clips:edit',
  'moderator:manage:announcements',
  'moderator:manage:banned_users',
  'moderator:manage:blocked_terms',
  'moderator:manage:chat_messages',
  'moderator:manage:shoutouts',
  'moderator:manage:unban_requests',
  'moderator:manage:warnings',
  'moderator:read:chat_settings',
  'moderator:read:chatters',
  'moderator:read:followers',
  'moderator:read:moderators',
  'moderator:read:vips',
  'user:bot',
  'user:read:chat',
  'user:write:chat',
]

export function TwitchAuthButton({
    loading = false,
    redirect
}: TwitchAuthButtonProps) {
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
          {BOT_SCOPES.map(scope => (
            <Badge
              key={scope}
              variant="light"
              color="violet"
              size="sm"
              radius="sm"
              ff="monospace"
            >
              {scope}
            </Badge>
          ))}
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