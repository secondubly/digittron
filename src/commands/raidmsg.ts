import { Command } from '../types.js'

const raidmsg: Command = {
    name: 'raidmsg',
    aliases: [],
    enabled: true,
    async execute(client, channel, _msg, _args, _apiClient) {
        client.say(
            channel,
            'raid message: second15RAID second15RAID second15RAID 01010010 01000001 01001001 01000100 00100001 00100001 00100001 second15RAID second15RAID second15RAID',
        )
    },
}

export default raidmsg
