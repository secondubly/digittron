let accessToken: string | null = null
let refreshPromise: Promise<Response> | null = null // prevent parallel refresh requests

const getToken = async () => {
    if (accessToken) return accessToken
    try {
        const twitchId: string = import.meta.env.VITE_TWITCH_ID ?? '89181064'
        const res = await fetch(`/api/spotify/token/${twitchId}`)

        const { access_token: accessToken } = await res.json()
        return accessToken
    } catch (error) {
        console.error('Failed to retrieve token', error)
    }
}

const refreshToken = async () => {
    if (refreshPromise) return refreshPromise

    refreshPromise = fetch('/api/spotify/token', {
        method: 'POST',
        credentials: 'include', // sends cookie with request
    })
        .then((res) => {
            if (!res.ok) throw new Error('Session expired')
            return res.json()
        })
        .then((data) => {
            accessToken = data.access_token
            return data.access_token
        })
        .finally(() => {
            refreshPromise = null
        })

    return refreshPromise
}

export const spotifyFetcher = async (path: string) => {
    const makeRequest = async (token: string) =>
        fetch(`https://api.spotify.com/v1${path}`, {
            headers: { Authorization: `Bearer ${token}` },
        })

    let token = await getToken()
    if (!token) token = await refreshToken()

    let res = await makeRequest(token)

    // Token expired mid-session — refresh and retry once
    if (res.status === 401) {
        token = await refreshToken()
        res = await makeRequest(token)
    }

    if (!res.ok) throw new Error(`Spotify error: ${res.status}`)
    if (res.status === 204) return null // e.g. no active device
    return res.json()
}
