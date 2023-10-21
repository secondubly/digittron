import * as tmi from 'tmi.js'
import { CLIENT_OPTIONS } from './lib/utils.js';

const client = new tmi.Client(CLIENT_OPTIONS);
await client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
	if(self) return;
	if(message.toLowerCase() === '!hello') {
		client.say(channel, `@${tags.username}, heya!`);
	}
});