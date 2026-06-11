import { Group } from "@mantine/core";
import { SpotifyAuthButton } from "../components/SpotifyAuthButton/SpotifyAuthButton";

const SpotifyLogin: React.FC = () => {

    return (
        <Group justify="center">
            <SpotifyAuthButton
                onAuth={() => { window.location.href = '/api/spotify/login'; }}
            />
        </Group>
)
}

export default SpotifyLogin