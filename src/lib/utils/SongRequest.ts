import { redisClient } from '../utils'
import { SpotifyApi, type AccessToken, type SimplifiedTrack } from '@spotify/web-api-ts-sdk'

const SPOTIFY_AUTH_TOKEN = JSON.parse((await redisClient.get('spotify_access_token')) as string) as AccessToken

const api = SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID ?? '', SPOTIFY_AUTH_TOKEN)
type SongData = {
	artist?: string
	title?: string
	id?: string
}

const getSpotifyData = (input: string): SongData | undefined => {
	const urlRegEx = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(track)(?::|\/)((?:[0-9a-zA-Z]){22})/
	let match = input.match(urlRegEx)
	// If user provided a URL
	if (match) {
		const albumOrTrack = match[1]
		const spotifyID = match[2]
		if (albumOrTrack !== 'track') {
			// if it's NOT a track then return an error
			throw Error('User did not provide a track.')
		} else {
			return {
				id: spotifyID
			}
		}
	}

	const titleRegEx = /^(.*?)\s-\s(.*?)$/
	match = input.match(titleRegEx)
	if (match) {
		const artist = match[1]
		const title = match[2]

		return {
			artist,
			title
		}
	}

	return undefined
}

const getSongInfo = async (input: SongData): Promise<SimplifiedTrack | undefined> => {
	if (input.title && input.artist) {
		const search_string = `${input.artist} - ${input.title}`
		const result = await api.search(search_string, ['track'], undefined, 1)
		if (result.tracks.items.length === 0) {
			return undefined
		}

		return result.tracks.items[0] as SimplifiedTrack
	}
}

export const addSongToQueue = async (input: string): Promise<boolean> => {
	const data = getSpotifyData(input)
	if (!data) {
		throw Error('Could not find a track with that information.')
	}
	const songInfo = await getSongInfo(data)
	if (!songInfo) {
		throw Error('Could not find a track with that information.')
	}

	// add song to queue
	await api.player.addItemToPlaybackQueue(songInfo.uri)
	return true
}

export const __testing =
	process.env.NODE_ENV === 'test'
		? {
				getSpotifyData
		  }
		: void 0
export { SongData }
