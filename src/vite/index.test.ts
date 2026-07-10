import { describe, expect, it } from 'vitest'
import { defineFigmaMainConfig, defineFigmaUiConfig } from './index'

describe('Figma Vite configs', () => {
  it('builds the main runtime as dist/code.js', () => {
    const config = defineFigmaMainConfig()
    const library = typeof config.build?.lib === 'object' ? config.build.lib : undefined
    const fileName = typeof library?.fileName === 'function' ? library.fileName('iife', 'code') : library?.fileName

    expect(config.build?.outDir).toBe('dist')
    expect(config.build?.lib).toMatchObject({ entry: 'src/code.ts', formats: ['iife'] })
    expect(fileName).toBe('code.js')
  })

  it('renames the generated UI document to dist/ui.html', () => {
    const config = defineFigmaUiConfig()
    const plugin = config.plugins?.at(-1) as { generateBundle(...arguments_: unknown[]): void } | undefined
    const html = { fileName: 'index.html', name: 'index.html', source: '', type: 'asset' as const }

    expect(plugin).toBeTruthy()
    plugin?.generateBundle({}, { 'index.html': html }, false)

    expect(config.build?.outDir).toBe('dist')
    expect(html.fileName).toBe('ui.html')
  })
})
