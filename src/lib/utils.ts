const URL_PATTERN =
    /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,6}\b(?:[-a-zA-Z0-9@:%_+.~#?&/=]*)/gi
// allow twitch or youtube links
const WHITELIST_PATTERN =
    /(?:twitch\.tv|clips\.twitch\.tv|youtube\.com|youtu\.be)/i

export function containsLink(message: string) {
    return URL_PATTERN.test(message)
}

export function isWhitelistedLink(message: string) {
    const matches = message.match(URL_PATTERN)
    if (!matches) return false
    return matches.every((url) => WHITELIST_PATTERN.test(url))
}

export function extractLinks(message: string): string[] {
    return message.match(URL_PATTERN) ?? []
}
