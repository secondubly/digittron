import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  root: 'src/web',
  publicDir: 'public',
  input: {
    main: resolve('src/web/index.html'),
    leaderboard: resolve('src/web/leaderboard.html')
  },
  build: {
    outDir: '../../dist/web',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/public': 'http://localhost:3000',
      '/ws': { target: 'ws://localhost:3000', ws: true },
    }
  },
})
