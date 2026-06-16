import type { Command, CommandContext } from '@lib/bot/types.js'

const raidmsg: Command = {
    name: 'raidmsg',
    aliases: [],

    description: 'the channel’s raid message',
    async execute({ say }: CommandContext) {
        say(
            'raid message: second15Raid 01010010 01000001 01001001 01000100 00100001 00100001 00100001 second15Raid',
        )
    },
}

export default raidmsg
