# digittron
Twitch bot for secondubly and his community, built in NodeJS with a React frontend using [Bun](https://bun.com)

## Project Structure
```
/digittron
├── data/
├── dist/ # built overlay
└── src/
    ├── api/ # api methods
    ├── bot/ # bot code
    │   └── twitch/ # twitch bot
    ├── core/ # shared functionality
    └── web/ # overlay system
```

## Development

### Local Development (Recommended)

```
bun run dev
```

This starts the twitch bot and frontend server with hot module reloading to track live changes

### Remote Development

*Coming Soon*

### Setup

1. Copy `.env.example` to `.env` and fill in credentials and fields as needed - note that some fields are optional.
2. Make sure that you have the appropriate authentication tokens in `data/`
    * You will need at minimum two token files for this project, one for the twitch bot itself, and one for the twitch broadcaster. 
    * While generating authentication tokens is outside the scope of this project, you can learn more about it [here](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/).
    * For generating spotify oauth tokens, see [here](https://developer.spotify.com/documentation/web-api/concepts/authorization).
    * The required scopes needed can be found [here](#scopes).
    * When saving the tokens, they need to be in the format of `tokens.${account_id}.json`. The spotify token (if being used) must be of the format `spotify.{twitch_owner_id}.json`.

### Running Locally (with Bun)

```
# install depenencies
bun install
# Build the api, and overlay interface
bun run build

# Run in development mode (with hot reloading)
bun run dev

# Run in production mode
bun run start
```


### Running with Docker
```
# Download the supplied docker-compose.yml file
# Add optional “-d” flag to run in detached mode
docker compose up [-d]

# You can also download the github package via: docker pull ghcr.io/secondubly/digittron:main
docker run -p 3000:3000 --name whatever_you_want digittron:main
```

### Environment Variables

* `TWITCH_CLIENT_ID`: Twitch application Client ID
* `TWITCH_CLIENT_SECRET`: Twitch application Client Secret
* `TWITCH_BOT_ID`: Twitch ID of bot account
* `TWITCH_BROADCASTER_ID`: Twitch ID of broadcaster account
* `TWITCH_CHANNELS`=comma separated list of channels to connect to
* `WEB_PORT`: Port that frontend runs on # defaults to 3000
* `NODE_ENV`=development # Optional: defaults to production
* `SPOTIFY_CLIENT_ID`: Spotify application Client ID # Optional
* `SPOTIFY_CLIENT_SECRET`: Spotify application Client Secret # Optional
* `STEAM_ID`: Used to grab Deadlock information # Optional


## Bot Commands

* `!backseat` - backseating message announcement
* `!blind` - message about first playthroughs (and backseating)
* `!commands` - list all available commands
* `!clip` - Clips the last 30 seconds of the stream
* `!d20` - roll a d20
* `!discord` - the discord url
* `!game` - shows the game (or change the stream game if you're a moderator)
* `!nowplaying` - gets the currently playing song (if available)
* `!playlist` - link to the stream playlist
* `!raidmsg` - shows the outgoing raid message
* `!rank` - Shows the broadcaster's deadlock rank
* `!title` - shows the stream title (or changes it if you're a moderator)
* `!wishlist` - shows throne and steam wishlist

# Scopes

These are the scopes required for full functionality of the bot:

| **Bot**                         | **Broadcaster**            | **Spotify**                 |
|---------------------------------|----------------------------|-----------------------------|
| chat:edit                       | bits:read                  | streaming                   |
| chat:read                       | channel:bot                | user-modify-playback-state  |
| moderator:manage:announcements  | channel:manage:broadcast   | user-read-playback-state    |
| moderator:manage:banned_users   | channel:manage:polls       | user-read-currently-playing |
| moderator:manage:blocked_terms  | channel:manage:predictions | user-read-email             |
| moderator:manage:chat_messages  | channel:manage:raids       | user-read-recently-played   |
| moderator:manage:chat_settings  | channel:manage:redemptions | user-read-private           |
| moderator:manage:shoutouts      | channel:manage:schedule    | user-top-read               |
| moderator:manage:unban_requests | channel:manage:videos      |                             |
| moderator:manage:warnings       | channel:read:editors       |                             |
| moderator:read:chat_settings    | channel:read:hype_train    |                             |
| moderator:read:chatters         | channel:read:polls         |                             |
| moderator:read:followers        | channel:read:predictions   |                             |
| moderator:read:moderators       | channel:read:redemptions   |                             |
| moderator:read:vips             | channel:read:subscriptions |                             |
| user:bot                        | channel:read:ads           |                             |
| user:read:chat                  | channel:read:vips          |                             |
| user:write:chat                 | clips:edit                 |                             |
|                                 | moderation:read            |                             |
|                                 | user:read:chat             |                             |
|                                 | user:read:subscriptions    |                             |

