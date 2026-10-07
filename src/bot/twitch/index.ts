import { init } from './init'

const startBot = async () => {
  init()
}

if (import.meta.main) {
  startBot()
}

export { startBot }
