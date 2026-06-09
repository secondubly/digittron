import { Group, UnstyledButton, Text } from "@mantine/core"
import { IconChevronRight } from "@tabler/icons-react";
import classes from './LoginButton.module.css'
import { useAuth } from "../../../contexts/AuthContext";

export const LoginButton = () => {
    const { login } = useAuth();

    return (
        <>
          <UnstyledButton className={classes.button} p="md" onClick={login}>
            <Group className={classes.group}>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  Login with Twitch
                </Text>
              </div>

              <IconChevronRight size={14} stroke={1.5} />
            </Group>
          </UnstyledButton>
        </>
    )
}