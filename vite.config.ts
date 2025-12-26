import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    root: 'src/web',
    publicDir: 'public',  
    build: {
        outDir: '../../build/web',
        emptyOutDir: true
    }
})