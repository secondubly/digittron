import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    root: 'src/web',
    publicDir: 'public',
    build: {
        outDir: '../../build/web',
        emptyOutDir: true,
    },
    server: {
        port: 5000, // dev server will run on port 5000
        proxy: {
            // custom proxy rules for dev server, allows shorthand for fetch requests
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },
    },
})
