import { log } from "./logger"

interface Task {
    name: string
    run: () => void | Promise<void>
}
 
const tasks: Task[] = []
let shuttingDown = false
 
/** Register something to stop. Tasks run in reverse order of registration. */
export function onShutdown(name: string, run: Task['run']) {
    tasks.push({ name, run })
}

// docker's grace period is 10 seconds, so we use 8 seconds as a default
export const setupShutdownHandlers = (timeoutMs = 8000) => {
    const shutdown = async (signal: string) => {
        if (shuttingDown) return // if we're already trying to shut down, don't start another run

        shuttingDown = true
        log.app.info({ signal }, 'shutting down')

        setTimeout(() => {
            log.app.error('shutdown timed out, forcing exit')
            process.exit(1)
        }, timeoutMs).unref()

        for (const task of [...tasks].reverse()) {
            try {
                await task.run()
                log.app.debug({ task: task.name }, 'stopped')
            } catch (err) {
                log.app.error({ err, task: task.name }, 'failed to stop cleanly')
            }
        }

        log.app.info('shutdown complete')
        process.exit(0)
    }

    process.on('SIGTERM', () => {
        void shutdown('SIGTERM') 
    })
    process.on('SIGINT', () => { 
        void shutdown('SIGINT')
    })
}