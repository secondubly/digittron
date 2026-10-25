// fake rows for testing the leaderboard layout

export interface Row {
    userId: string
    name: string
    firsts: number
}

const row = (n: number, name: string, firsts: number): Row => ({ userId: String(n), name, firsts })

// Ten rows with the awkward cases: a one-letter name, a 25-character name (Twitch's maximum),
// non-Latin text, accents, a tie (Bravo and Charlie), and counts from one to three digits.
export const FULL: Row[] = [
    row(1, 'FirstBlood_Fan', 128),
    row(2, 'xX_NightOwl_Xx', 97),
    row(3, 'ThisNameIsTwentyFiveChars', 64),
    row(4, '日本語ユーザー', 33),
    row(5, 'Bravo', 12),
    row(6, 'Charlie', 12),
    row(7, 'Müller', 9),
    row(8, 'zoe', 5),
    row(9, 'W', 2),
    row(10, 'SomeoneElse', 1),
]

// More rows than the API returns (it sends 10), to see how the page copes with overflow
const MANY: Row[] = Array.from({ length: 25 }, (_, i) => row(i + 1, `Viewer${i + 1}`, 40 - i))

export const SAMPLES: Record<string, Row[]> = {
    full: FULL,
    few: FULL.slice(0, 3),
    one: FULL.slice(0, 1),
    many: MANY,
    empty: [],
}