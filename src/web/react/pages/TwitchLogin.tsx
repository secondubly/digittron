import { Group } from "@mantine/core";
import { TwitchAuthButton } from "../components/twitch_button/TwitchAuthButton";

const TwitchLogin: React.FC = () => {

    return (
        <Group justify="center">
            <TwitchAuthButton
                redirect={() => { window.location.href = '/api/auth/twitch/bot-login'; }}
            />
        </Group>
)
}

export default TwitchLogin