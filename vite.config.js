import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'game.js',
        chunkFileNames: 'game.js', // Forces chunks into main file
        assetFileNames: 'game-[name].[ext]',
        manualChunks: undefined // Prevents automatic chunking
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        // This is important for virtual hosted sites
        changeOrigin: true,
        // Optional: remove the '/api' prefix from the URL before forwarding to the backend
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  define: {
    BUILD_DATE: JSON.stringify(new Date().toISOString()),
  },
})
