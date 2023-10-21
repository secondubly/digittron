import * as tmi from 'tmi.js'
import { CLIENT_OPTIONS } from './lib/utils.js'

export const client = new tmi.Client(CLIENT_OPTIONS)
