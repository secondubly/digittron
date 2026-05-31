import { useEffect } from "react";

const SpotifyLogin: React.FC = () => {
    useEffect(() => {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array)
        const state = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: '4a78a9f1ae8b4f008903da141ee4ccef',
            scope: 'user-read-playback-state user-modify-playback-state',
            redirect_uri: 'http://127.0.0.1:4000/api/spotify/callback',
            state,
        })

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
    })

    return null
}

export default SpotifyLogin