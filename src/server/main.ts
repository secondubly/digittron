import { init as buildServer } from './startup'

async function main() {
    // disable bot by overriding NODE_ENV check in buildApp
    const app = await buildServer({ withBot: false })

    await app.listen({
        port: (process.env.API_PORT as unknown as number) ?? 4001,
        host: '0.0.0.0',
    })
}

main().catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
})
