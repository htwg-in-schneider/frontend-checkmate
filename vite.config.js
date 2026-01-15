import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


export default defineConfig({

  base: '/frontend-checkmate/',   
  

  plugins: [
    vue(),

  ],
  
  resolve: {
    alias: {
   
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  build: {
    outDir: 'dist',
  }
})