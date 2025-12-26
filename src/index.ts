import { init as apiInit } from "./api/index.js"
import { init as webInit  } from "./web/index.js"

const config = {
    API_PORT: process.env.API_PORT ??  '4001',
    WEB_PORT: process.env.WEB_PORT ?? '5001'
}

const startup = async () => {
    try {
        // start up api
        apiInit(parseInt(config.API_PORT))
        
        // start frontend
        webInit(parseInt(config.WEB_PORT))
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

if (import.meta.main) {
    startup()
}