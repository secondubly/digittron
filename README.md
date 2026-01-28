# digittron
Twitch bot for secondubly and his community, built in NodeJS with a React frontend using pnpm as a package manager

## Project Structure
```
digittron
├── build # build files
├── data # database file and schema
├── initdb.sh # init (and seeding) script for database
└── src
    ├── api # API server
    ├── bot # twitch bot
    │   └── commands # twitch bot commands
    ├── lib # shared core functionality
    │   ├── bot # commonly used types
    │   ├── db # database models
    │   └── utils # utility functions
    └── web # frontend 
```

## Development

### Setup

1. Copy `.env.example` to `.env` and fill in your credentials.
    * For bot access token, use the following url: 
        ```
        https://id.twitch.tv/oauth2/authorize?client_id=CLIENT_ID&redirect_uri=http://localhost:3000&response_type=code&scope=channel:edit:commercial+channel:moderate+chat:read+chat:edit+clips:edit+moderator:manage:announcements+moderator:manage:banned_users+moderator:manage:blocked_terms+moderator:manage:chat_messages+moderator:manage:shoutouts+moderator:manage:unban_requests+moderator:manage:warnings+moderator:read:chat_settings+moderator:read:chatters+moderator:read:followers+moderator:read:moderators+moderator:read:vips+user:bot+user:read:chat+user:write:chat&force_verify=true
        ```
    * For broadcaster access token, use the following url:
        ```
        https://id.twitch.tv/oauth2/authorize?client_id=CLIENT_ID&redirect_uri=http://localhost:3000&response_type=code&scope=bits:read+channel:bot+channel:manage:broadcast+channel:manage:polls+channel:manage:predictions+channel:manage:raids+channel:manage:redemptions+channel:manage:schedule+channel:manage:videos+channel:read:editors+channel:read:hype_train+channel:read:polls+channel:read:predictions+channel:read:redemptions+channel:read:subscriptions+channel:read:vips+clips:edit+moderation:read+user:read:subscriptions&force_verify=true
        ```
    * In development mode, you will need an ngrok auth token - you can get one by signing up here: http://ngrok.com. This is used to enable the “Bot” badge for the bot, allowing extra functionality.
    * The `EVENTSUB_SECRET` is just a randomly generated string.



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
# Add optional “-d” flag to run in detached mode
docker compose up
```

### Environment Variables

* `CLIENT_ID`: Twitch application Client ID
* `CLIENT_SECRET`: Twitch application Client Secret
* `BOT_ID`: Twitch ID of bot account
* `TWITCH_ID`: Twitch broadcaster/owner account ID
* `CHANNELS`: List of twitch channels to connect to (separated by commas)
* `SPOTIFY_CLIENT_ID`: Spotify application Client ID (Optional)
* `SPOTIFY_CLIENT_SECRET`: Spotify application client secret (Optional)
* `REDIS_HOST`: Hostname for your redis instance (in development mode, default is localhost)
* `REDIS_PORT`: Port for your redis instance (default is 6379)
* `NODE_ENV`: Whether to run bot in production or development mode
* `NGROK_AUTH_TOKEN`: Only needed in development mode, ngrok auth token is used to create a EventSub adapter
* `EVENTSUB_SECRET`: Only needed in development mode, eventsub secret is used to validate connections to EventSub adapter


## Bot Commands

* `!anniversary` - Prints stream anniversary message
* `!backseat` - backseating message announcement
* `!commands` - list all available commands
* `!d20` - roll a d20
* `!details` lists a summary of the currently playing game
* `!discord` - list the discord url
* `!game` - shows the game (or change the stream game if you're a moderator)
* `!permit` - allow specified user to post links without being timed out
* `!raidmsg` - shows the outgoing raid message
* `!roulette` - I count six shots (okay maybe just one)
* `!subgoal` - subgoals for the anniversary stream
* `!test` - test command for mods/broadcaster
* `!title` - shows the stream title (or changes it if you're a moderator)
* `!wishlist` - shows throne and steam wishlist