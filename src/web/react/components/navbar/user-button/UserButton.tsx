import { IconChevronRight } from '@tabler/icons-react';
import { Avatar, Group, Text, UnstyledButton } from '@mantine/core';
import classes from './UserButton.module.css';
// @ts-expect-error false positive error
import placeholder from '../../../assets/images/h_jjk.jpg'
import { forwardRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext'

export const UserButton = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(  
  ({ ...others}, ref) => {
        const { user } = useAuth();

        return (
      <UnstyledButton className={classes.user} p="md" ref={ref} {...others} w='100%'>
        <Group>
          <Avatar
            src={user?.avatarUrl}
            radius="xl"
            alt="Hiromi Higuruma"
          />

          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {user?.displayName}
            </Text>

            {/* <Text c="dimmed" size="xs">
              hiromihiguruma@outlook.jp
            </Text> */}
          </div>

          <IconChevronRight size={14} stroke={1.5} />
        </Group>
      </UnstyledButton>
        )
  }
)