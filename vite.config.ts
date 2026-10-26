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
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/public': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false 
      },
      '/ws': { 
        changeOrigin: true,
        target: 'ws://localhost:3000', 
        ws: true 
      },
    }
  },
})
