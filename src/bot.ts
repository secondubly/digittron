import { client } from './client.js'
import { onConnect } from './listeners/connect.js';

let tryCount = 0
await client.connect().catch((err) => {
    tryCount++
    // TODO: refresh token and try connection again
    console.error(err)
    if( tryCount < 3) {
        client.connect()
    }
});

client.on('connected', onConnect)

client.on('message', (channel, tags, message, self) => {
	if(self) return;
	if(message.toLowerCase() === '!hello') {
		client.say(channel, `@${tags.username}, heya!`);
	}
});