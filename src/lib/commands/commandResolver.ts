import { Userstate } from "tmi.js"
import { client } from "../../client"
import { isNullOrEmpty } from "../utils"

export function resolver(channel: string, user: Userstate, message: string) {
    const { command, args } = parseCommand(message)

    if(isNullOrEmpty(command)) return

    switch (command) {
        case 'test':
            client.say(channel, 'this is a test of the emergency bot system')
            break
        default:
            break
    }
}

const parseCommand = (message: string) => {
    const regex = /\!(.*?)$/gm
    const fullCommand = regex.exec(message)

    if (fullCommand) {
        // position 0 is the command delimiter
        const splitCommand = fullCommand[1].split(' ')
        const command = splitCommand[0]
        
        splitCommand.shift()
        return {
            command,
            args: splitCommand
        }
    }

    return {}
}
