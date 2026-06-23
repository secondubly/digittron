# digittron
Twitch bot for secondubly and his community, built in NodeJS with a React frontend using pnpm as a package manager

## Project Structure
```
digittron
├── build # build files
├── db # database location
├── src 
│   ├── bot # twitch bot
│   ├── core # shared functions/classes/types
│   ├── server # API
│   └── web # frontend
└── tests # unit tests
```

## Development

### Setup

1. Copy `.env.example` to `.env` and fill in credentials and fields as needed.
    * In development mode, you will need an ngrok auth token - you can get one by signing up here: http://ngrok.com. This is used to enable the “Bot” badge for the bot, allowing extra functionality.
2. On first launch the bot will ask you to navigate to a webpage to give itself permissions from both the broadcaster, and the account the bot will be running as. Once those are done, the bot will run as normal.
    * If you wish to use spotify related commands, you **must** fill out the SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET fields in your env file. How to get those is outside the scope of this project, but you can read more about it [here](https://developer.spotify.com/documentation/web-api/concepts/apps).




### Running Locally (with PNPM)

```
# install depenencies
pnpm install
# run API, bot, and frontend in development mode (with hot reloading)
pnpm run dev
```


### Running Locally (with Docker)

```
# Build and run with docker - will create a persistent redis service as well
# Download the supplied docker-compose.yml file
# Add optional “-d” flag to run in detached mode
docker compose up
```

### Environment Variables

* `TWITCH_CLIENT_ID`: Twitch application Client ID
* `TWITCH_CLIENT_SECRET`: Twitch application Client Secret
* `TWITCH_BOT_ID`: Twitch ID of bot account
* `TWITCH_BROADCASTER_ID`: Twitch ID of broadcaster account
* `TWITCH_CHANNELS`=comma separated list of channels to connect to
* `REDIS_URL`: URL to connect to your redis instance (in development mode, default is localhost)
* `ENCRYPTION_KEY`= Used to encrypt access tokens and refresh tokens
* `SESSION_SECRET`: Used to encrypt login sessions for the dashboard
* `COOKIE_SECRET`: Used to encrypt cookies for sensitive information
* `API_PORT`: Port that backend server runs on (defaults to 4000)
* `WEB_PORT`: Port that frontend runs on (in development mode only, defaults to 5000)
* `NODE_ENV`=development # defaults to production if not provided
* `SPOTIFY_CLIENT_ID`: Spotify application Client ID (Optional)
* `SPOTIFY_CLIENT_SECRET`: Spotify application client secret (Optional)
* `STEAM_ID`: Used to grab Deadlock information (Optional)
* `RATE_LIMIT_MAX`: Used to prevent server overload
* `NGROK_AUTH_TOKEN`: Only needed in development mode, ngrok auth token is used to create a EventSub adapter
* `EVENTSUB_SECRET`: Only needed in development mode, eventsub secret is used to validate connections to EventSub adapter
* `CLIENT_URL`: URL that the built client runs on (defaults to http://localhost:4000)


## Bot Commands

* `!anniversary` - Prints stream anniversary message
* `!backseat` - backseating message announcement
* `!blind` - message about first playthroughs (and backseating)
* `!commands` - list all available commands
* `!d20` - roll a d20
* `!details` a summary of the current game
* `!discord` - the discord url
* `!game` - shows the game (or change the stream game if you're a moderator)
* `!permit` - allow specified user to post links without being timed out
* `!playlist` - link to the stream playlist
* `!raidmsg` - shows the outgoing raid message
* `!rank` - Shows the broadcaster's deadlock rank
* `!roulette` - I count six shots (okay maybe just one)
* `!subgoal` - subgoals for the anniversary stream
* `!test` - test command for mods/broadcaster
* `!title` - shows the stream title (or changes it if you're a moderator)
* `!wishlist` - shows throne and steam wishlist