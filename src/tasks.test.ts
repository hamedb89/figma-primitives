import { describe, expect, it } from 'vitest'
import { createTaskEngine } from './tasks'

describe('task engine', () => {
  it('tracks exact task completion', async () => {
    const engine = createTaskEngine()
    await engine.run({ label: 'Inspect', type: 'selection.inspect' }, async () => 42)
    expect(engine.getSnapshot()).toMatchObject([{ status: 'success', type: 'selection.inspect' }])
  })
})
