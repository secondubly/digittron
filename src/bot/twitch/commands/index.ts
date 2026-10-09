import type { BotCommand } from '@twurple/easy-bot'
import { features } from './features.config'
import type { Deps } from '../deps'

// core commands
import backseat from './backseat'
import blind from './blind'
import clip from './clip'
import discord from './discord'
import game from './game'
import test from './test'
import title from './title'
import testalert from './testalert'
import nowplaying from './nowplaying'
import rank from './rank'
import d20 from './d20'

const commandList: BotCommand[] = []

export function buildCommands(deps: Deps): BotCommand[] {
  if (features.core) {
    commandList.push(backseat, blind, clip(deps), discord, game(deps), test, title(deps), nowplaying, rank)
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
