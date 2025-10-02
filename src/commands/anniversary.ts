import { Command } from "../types.js"

const anniversary: Command = {
    name: 'anniversary',
    aliases: ['anni'],
    enabled: false,
    async execute(client, channel, _msg) {
        const broadcaster = client.currentChannels.find((chan) => chan.toLocaleLowerCase() === channel.toLocaleLowerCase()) ?? channel
        client.say(channel, `@${broadcaster}'s stream anniversary celebration is september 27 - september 30! During this time we have various sub goals and individual sub rewards that you can see by using !subgoal. All proceeds will be going to updating my pngtuber model!`)
    }
}
export default anniversary