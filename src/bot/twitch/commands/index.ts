import type { BotCommand } from '@twurple/easy-bot'
import { features } from './features.config'
import type { Deps } from '../deps'

// core commands
import backseat from './backseat'
import blind from './blind'
import clip from './clip'
import details from './details'
import discord from './discord'
import game from './game'
import test from './test'
import title from './title'
import testalert from './testalert'
import nowplaying from './nowplaying'
import playlist from './playlist'
import rank from './rank'
import d20 from './d20'
import { log } from '@core/logger'

const commandList: BotCommand[] = []

export function buildCommands(deps: Deps): BotCommand[] {
  if (features.core) {
    commandList.push(
      backseat, blind, clip(deps), 
    details(deps), discord, game(deps), 
    playlist,
    test, title(deps), rank)
  }

  if (features.music) {
    if (!Bun.env.SPOTIFY_CLIENT_ID || !Bun.env.SPOTIFY_CLIENT_SECRET) {
      log.twitch.warn('Spotify variables not set, skipping loading music commands')
    } else {
      commandList.push(nowplaying) 
    }
  }

  if (features.debug) {
    commandList.push(testalert, test)
  }

  if (features.games) {
    commandList.push(d20)
    // TODO: add roulette game
  }

  return commandList
}
