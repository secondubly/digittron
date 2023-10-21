import type { Options } from "tmi.js"
import dotenv from 'dotenv'
dotenv.config({ path: '..\.env.development.local' }) // TODO: in production you can remove the path

export const CLIENT_OPTIONS: Options = {
    options: {
        debug: (process.env.NODE_ENV === 'development' ? true : false)
    },
    channels: envParseArray('TWITCH_CHANNELS', []),
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.BOT_OAUTH_TOKEN
    }
}

export function envParseArray(key: string, defaultValue: string[]) {
    const value = process.env[key];
    if (!value) {
      if (defaultValue === void 0)
        throw new ReferenceError(`[ENV] ${key} - The key must be an array, but is empty or undefined.`);
      return defaultValue;
    }
    return value.split(" ");
}