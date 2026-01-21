import { defineConfig } from 'vite'

export default defineConfig({
  base: './',  // ← This fixes GitHub Pages paths
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})
