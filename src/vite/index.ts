import { defineConfig, type UserConfig } from 'vite'

export function defineFigmaMainConfig(entry = 'src/code.ts'): UserConfig {
  return defineConfig({ build: { emptyOutDir: false, lib: { entry, fileName: () => 'code.js', formats: ['iife'], name: 'FigmaPlugin' }, minify: false, outDir: 'dist' } })
}

export function defineFigmaUiConfig(config: UserConfig = {}): UserConfig {
  return defineConfig({
    ...config,
    build: { ...config.build, emptyOutDir: false, outDir: 'dist' },
    plugins: [
      ...(config.plugins ?? []),
      {
        name: 'figma-ui-html',
        generateBundle(_options, bundle) {
          const html = Object.values(bundle).find((output) => output.type === 'asset' && output.fileName.endsWith('.html'))
          if (html) html.fileName = 'ui.html'
        },
      },
    ],
  })
}
