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

	private static addItemToPlaybackQueue = async (song: SimplifiedTrack): Promise<number | undefined> => {
		try {
			await this.api.player.addItemToPlaybackQueue(song.uri)
			return this.queue.push(song) + 1
		} catch (e) {
			console.error(e)
			return undefined
		}
	}

	public static addSongToQueue = async (input: string): Promise<{ song: SimplifiedTrack; index: number } | undefined> => {
		const data = this.getSpotifyData(input)
		if (!data) {
			throw new Error('Could not find a track with that information.')
		}
		const songInfo = await this.getSongInfo(data)
		if (!songInfo) {
			throw new Error('Could not find a track with that information.')
		}

		// add song to queue
		const index = await this.addItemToPlaybackQueue(songInfo)
		if (!index) {
			return undefined
		}

		return {
			song: songInfo,
			index
		}
	}
}
