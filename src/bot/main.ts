import { startBot } from './startup'

startBot().catch((err) => {
    console.error('Failed to start bot:', err)
    process.exit(1)
})
