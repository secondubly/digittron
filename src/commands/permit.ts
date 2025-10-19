import { Command } from '../types.js'

const test: Command = {
    name: 'permit',
    aliases: [],
    enabled: true,
    async execute(client, channel, msg, args, _apiClient) {
        const { isMod, isBroadcaster } = msg.userInfo
        if (!isMod || !isBroadcaster) {
            return
        }

        const username = args[0]
        const { userName: author } = msg.userInfo
        if (!username) {
            client.say(
                channel,
                `@${author} you didn't include the user to permit!`,
            )
            return
        } else {
            client.say(
                channel,
                `@${username} you have have been permitted 60 seconds to post a link!`,
            )
        }
    },
}

export default test
