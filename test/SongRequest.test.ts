import { expect, test, describe } from 'vitest'
import { __testing } from '../src/lib/utils/SongRequest'
const { getSpotifyData } = __testing

describe('song request tests', () => {
    test('getSpotifyData - return undefined', () => {
        expect(getSpotifyData('')).toBe(undefined)
    })
})