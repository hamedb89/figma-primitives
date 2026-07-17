import { defineConfig } from 'vite'

export default defineConfig({
  root: 'docs',
  base: './',
  build: {
    outDir: '../docs-dist',
    emptyOutDir: true,
  },
})
