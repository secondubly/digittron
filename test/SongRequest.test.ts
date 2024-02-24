import { expect, test, describe, beforeAll, assertType } from 'vitest'
import { __testing, type SongData } from '../src/lib/utils/SongRequest'
const { getSpotifyData } = __testing

beforeAll(() => {
	const SPOTIFY_AUTH_TOKEN = 'MOCK_TOKEN'
})


describe('song request tests', () => {
    test('getSpotifyData - return undefined', () => {
        expect(getSpotifyData('')).toBeUndefined()
    })

    test('getSpotifyData - return track data', () => {
        assertType<SongData>(getSpotifyData('artist - track'))
        expect(getSpotifyData('artist - track')).toEqual(
            expect.objectContaining({
                artist: expect.any(String),
                title: expect.any(String)
            })
        )
    })
})