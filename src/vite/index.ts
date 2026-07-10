import { defineConfig, type UserConfig } from 'vite'

export function defineFigmaMainConfig(entry = 'src/code.ts'): UserConfig {
  return defineConfig({ build: { emptyOutDir: false, lib: { entry, fileName: () => 'code.js', formats: ['iife'], name: 'FigmaPlugin' }, minify: false, outDir: 'dist' } })
}

export function defineFigmaUiConfig(config: UserConfig = {}): UserConfig {
  return defineConfig({ ...config, build: { ...config.build, emptyOutDir: false, outDir: 'dist/ui' } })
}
