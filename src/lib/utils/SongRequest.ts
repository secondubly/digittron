import { redisClient } from '../utils.js'
import { SpotifyApi, type AccessToken, type SimplifiedTrack } from '@spotify/web-api-ts-sdk'

const SPOTIFY_AUTH_TOKEN = JSON.parse((await redisClient.get('spotify_access_token')) as string) as AccessToken

type SongData = {
	artist?: string
	title?: string
	id?: string
}

export class Spotify {
	private static queue: SimplifiedTrack[] = []
	private static api = SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID ?? '', SPOTIFY_AUTH_TOKEN)

	private static getSpotifyData = (input: string): SongData | undefined => {
		const urlRegEx = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track)(?::|\/)((?:[0-9a-zA-Z]){22})/
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
					type: albumOrTrack,
					id: spotifyID
				}
			}
		}

		const titleRegEx = /^(.*?)\s-\s(.*?)$/m
		match = input.match(titleRegEx)
		if (match) {
			const artist = match[1]
			const title = match[2]

			return {
				type: 'track',
				artist,
				title
			}
		}

		return undefined
	}

	private static getSongInfo = async (input: SongData): Promise<SimplifiedTrack | undefined> => {
		if (input.title && input.artist) {
			const search_string = `${input.artist} - ${input.title}`
			const result = await this.api.search(search_string, ['track'], undefined, 1)
			if (result.tracks.items.length === 0) {
				return undefined
			}

			return result.tracks.items[0] as SimplifiedTrack
		}
	}

	private static addItemToPlaybackQueue = async (song: SimplifiedTrack): Promise<void> => {
		try {
			await this.api.player.addItemToPlaybackQueue(song.uri)
			this.queue.push(song)
			return
		} catch (e) {
			console.error(e)
		}
	}

	public static addSongToQueue = async (input: string): Promise<boolean> => {
		const data = this.getSpotifyData(input)
		if (!data) {
			throw Error('Could not find a track with that information.')
		}
		const songInfo = await this.getSongInfo(data)
		if (!songInfo) {
			throw Error('Could not find a track with that information.')
		}

		// add song to queue
		await this.addItemToPlaybackQueue(songInfo)
		return true
	}
}
