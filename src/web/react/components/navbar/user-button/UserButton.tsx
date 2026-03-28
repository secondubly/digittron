import { IconChevronRight } from '@tabler/icons-react';
import { Avatar, Group, Text, UnstyledButton } from '@mantine/core';
import classes from './UserButton.module.css';
import placeholder from '../../../assets/images/h_jjk.jpg'

export function UserButton() {
  return (
    <UnstyledButton className={classes.user} p="md">
      <Group>
        <Avatar
          src={placeholder}
          radius="xl"
          alt="Harriette Spoonlicker"
        />

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            Harriette Spoonlicker
          </Text>

          <Text c="dimmed" size="xs">
            hspoonlicker@outlook.com
          </Text>
        </div>

        <IconChevronRight size={14} stroke={1.5} />
      </Group>
    </UnstyledButton>
  );
}