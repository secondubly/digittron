import * as tmi from 'tmi.js'

const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: 'bot_account',
		password: 'oauth:<token here>'
	},
	channels: [ 'channel_here' ]
});
await client.connect().catch(console.error);
client.on('message', (channel, tags, message, self) => {
	if(self) return;
	if(message.toLowerCase() === '!hello') {
		client.say(channel, `@${tags.username}, heya!`);
	}
});