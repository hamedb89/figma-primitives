import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'react/index': 'src/react/index.ts',
        'vite/index': 'src/vite/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: { external: ['react', 'react/jsx-runtime', 'vite'] },
  },
})
