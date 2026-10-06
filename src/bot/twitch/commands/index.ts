import type { BotCommand } from "@twurple/easy-bot";
import { features } from "./features.config";
import type { Deps } from "../deps";

// core commands
import backseat from "./backseat";
import blind from "./blind";
import discord from "./discord";
import test from "./test";
import title from "./title";
import testalert from "./testalert";

const commandList: BotCommand[] = []

// general commands

export function buildCommands(deps: Deps): BotCommand[] {
    if (features.core) {
        commandList.push(backseat, blind, discord, test, title(deps))
    }

    if (features.debug) {
        commandList.push(testalert)
    }

    return commandList
}