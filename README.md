# figma-primitives

Typed building blocks for Figma plugins.

`figma-primitives` provides the runtime seams that most plugins need—without bringing along product behavior, backend assumptions, or a UI system.

```ts
import { createLogger, createTaskEngine } from 'figma-primitives'

const logger = createLogger('ui')
const tasks = createTaskEngine({ logger })

await tasks.run(
  { type: 'selection.inspect', label: 'Inspect selection' },
  async ({ id, signal, progress }) => {
    progress({ label: 'Reading selected layers' })
    return protocol.request('selection.inspect', { taskId: id, signal })
  },
)
```

## What it gives you

- Typed request/response messaging between plugin main and UI
- Exact task ownership, progress, cancellation, and structured errors
- Serializable Figma layer projections and selection state
- Abortable JSON networking with timeouts and decoders
- Structured, subscribable logging for main and UI runtimes
- Small React bindings for tasks, selections, tabs, and layer pickers
- Reusable Vite configurations for `code.js` and UI builds

The package deliberately excludes endpoints, domain schemas, synthesis, fixture bindings, and other application-specific behavior.

## Install

```sh
npm install figma-primitives
```

React and Vite are optional peer dependencies. Install only what your plugin uses.

## Entry points

| Import | Purpose |
| --- | --- |
| `figma-primitives` | Protocols, tasks, layers, selection, networking, errors, and logging |
| `figma-primitives/react` | React providers, hooks, tabs, and layer selection |
| `figma-primitives/vite` | Vite configs for Figma main and UI bundles |

## Core primitives

### Typed main ↔ UI protocol

Define the commands once, then use the same definition on either side of the Figma boundary.

```ts
import { createProtocol, type CommandDefinition } from 'figma-primitives'

type Commands = {
  'selection.inspect': CommandDefinition<
    { taskId: string },
    { layerCount: number }
  >
}

const protocol = createProtocol<Commands>(port)

protocol.handle('selection.inspect', async ({ taskId }) => {
  return { layerCount: figma.currentPage.selection.length }
})

const result = await protocol.request('selection.inspect', { taskId: 'task-1' })
```

The transport is intentionally tiny: implement `post` and `subscribe`, or use `createWindowPort` in the UI.

### Owned, cancellable tasks

```ts
const tasks = createTaskEngine({ maxTasks: 50 })

const result = await tasks.run(
  { blocking: true, label: 'Publish components', type: 'components.publish' },
  async ({ signal, progress }) => {
    progress({ current: 1, total: 3, label: 'Collecting components' })
    return publishComponents({ signal })
  },
)

tasks.cancel(taskId)
```

Each task has a stable id and finishes as `success`, `error`, or `cancelled`. Subscribe to the engine to render current and recent work.

### Serializable layer inspection

```ts
import { inspectLayer } from 'figma-primitives'

const layer = inspectLayer(figma.currentPage.selection[0], figma.currentPage.id, 2)
```

`inspectLayer` projects a Figma-like node into a serializable `FigmaLayer`, including bounds, text, children, and capability flags.

### Abortable JSON networking

```ts
import { createNetworkClient } from 'figma-primitives'

const api = createNetworkClient({
  baseUrl: 'https://api.example.com',
  timeoutMs: 10_000,
})

const document = await api.get<{ id: string }>('/documents/123', { signal })
```

Requests share task cancellation signals, turn non-success responses into `PluginError`, and can validate responses through a custom decoder.

## React bindings

```tsx
import { TaskProvider, useTasks } from 'figma-primitives/react'

function TaskStatus() {
  const tasks = useTasks()
  const active = tasks.filter((task) => task.status === 'running')
  return <span>{active.length ? `${active.length} running` : 'Ready'}</span>
}

export function App() {
  return (
    <TaskProvider engine={tasks}>
      <TaskStatus />
    </TaskProvider>
  )
}
```

The React entry point also exports `useSelection`, `Tabs`, and `SelectLayer`.

## Vite setup

Build the Figma main runtime as `dist/code.js`:

```ts
// vite.main.config.ts
import { defineFigmaMainConfig } from 'figma-primitives/vite'

export default defineFigmaMainConfig('src/code.ts')
```

Build the UI into `dist/ui`:

```ts
// vite.config.ts
import { defineFigmaUiConfig } from 'figma-primitives/vite'

export default defineFigmaUiConfig()
```

## Development

```sh
npm install
npm run check
npm run build
```

- `npm run check` runs TypeScript and the test suite.
- `npm run build` creates ESM JavaScript and type declarations in `dist`.
- `npm run dev` rebuilds the package in watch mode.

## Principles

- **Explicit ownership:** async work belongs to a task with one id and one lifecycle.
- **Serializable boundaries:** main/UI messages and layer data stay inspectable.
- **Framework-light core:** React and Vite live behind optional entry points.
- **No hidden product behavior:** applications own their endpoints, schemas, and decisions.

## License

[MIT](./LICENSE)
