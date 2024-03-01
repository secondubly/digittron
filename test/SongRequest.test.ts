import { expect, test, describe, beforeAll } from 'vitest'
import { Spotify } from '../src/lib/utils/SongRequest'
import { SdkOptions } from '@spotify/web-api-ts-sdk'

describe("Spotify Song Requests", () => {
    let handler: typeof Spotify
    beforeAll(() => {
        // SEE: https://github.com/spotify/spotify-web-api-ts-sdk/blob/main/src/test/SpotifyApiBuilder.ts#L68
        // for how to build out integration tests with the spotify web api
        handler = Spotify
    })  

    describe('Add an empty string to song queue', () => {
        test('getSpotifyData - throws error', async () => {
            await expect(handler.addSongToQueue('')).rejects.toThrowError(/^Could not find a track with that information.$/)
        })
    })
})