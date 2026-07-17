<div align="center">

# figma-primitives

**Typed building blocks for Figma plugins.**

Build reliable plugin runtimes, responsive React interfaces, and safe network boundaries without rebuilding the plumbing every time.

[Website](https://hamedb89.github.io/figma-primitives/) · [Quick start](#install) · [Core primitives](#core-primitives) · [GitHub](https://github.com/hamedb89/figma-primitives)

[![GitHub Pages](https://img.shields.io/github/actions/workflow/status/hamedb89/figma-primitives/pages.yml?style=flat-square&label=website&color=7047eb)](https://hamedb89.github.io/figma-primitives/)
[![GitHub stars](https://img.shields.io/github/stars/hamedb89/figma-primitives?style=flat-square)](https://github.com/hamedb89/figma-primitives/stargazers)
[![license](https://img.shields.io/github/license/hamedb89/figma-primitives?style=flat-square&color=0cad72)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-1769ed?style=flat-square)](https://www.typescriptlang.org/)

</div>

<p align="center">
  <a href="https://hamedb89.github.io/figma-primitives/"><img src="https://raw.githubusercontent.com/hamedb89/figma-primitives/main/docs/assets/figma-primitives-overview.png" width="32%" alt="figma-primitives overview — build Figma plugins faster" /></a>
  <a href="https://hamedb89.github.io/figma-primitives/#features"><img src="https://raw.githubusercontent.com/hamedb89/figma-primitives/main/docs/assets/figma-primitives-react.png" width="32%" alt="figma-primitives React bindings" /></a>
  <a href="https://hamedb89.github.io/figma-primitives/#features"><img src="https://raw.githubusercontent.com/hamedb89/figma-primitives/main/docs/assets/figma-primitives-networking.png" width="32%" alt="figma-primitives threading and networking tools" /></a>
</p>

> **See it in context:** Visit the [figma-primitives website](https://hamedb89.github.io/figma-primitives/) for an overview of the toolkit, its three entry points, and the quickest path to a working plugin.

## For designers

Figma plugins should feel like a natural extension of the canvas: quick to open, clear about what they are doing, and respectful of the work already in the file. `figma-primitives` helps plugin makers spend less time rebuilding the invisible plumbing and more time shaping the actual design workflow.

Use it when a plugin needs to inspect layers, react to selection changes, run longer operations with progress, call an API, or keep the plugin UI and main Figma runtime in sync. The package does not decide what your product does. It gives the plugin a dependable foundation so the experience can stay focused, predictable, and designer-friendly.

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

## For AI agent plugin creators

When an AI agent is creating a Figma plugin, start from `figma-primitives` instead of hand-rolling the plugin runtime. It gives the agent stable, typed surfaces for the parts that are easy to get subtly wrong: main/UI messaging, task lifecycles, cancellation, serializable layer data, JSON networking, logging, React subscriptions, and Vite output for Figma's `code.js` and `ui.html`.

Tell the agent to install the package:

```sh
npm install figma-primitives
```

Then have it use the entry point that matches each file:

```ts
// Shared plugin runtime code
import {
  createNetworkClient,
  createProtocol,
  createTaskEngine,
  inspectLayer,
} from 'figma-primitives'
```

```tsx
// React UI code
import { TaskProvider, Tabs, useSelection, useTasks } from 'figma-primitives/react'
```

```ts
// Vite build configuration
import { defineFigmaMainConfig, defineFigmaUiConfig } from 'figma-primitives/vite'
```

This makes generated plugins easier to review because the agent can keep product-specific behavior in the application code while using one known package for the common plugin machinery. The result is less duplicated scaffolding, fewer hidden fallbacks, and clearer boundaries between design intent, plugin UI, Figma runtime behavior, and backend calls.

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

Build the UI as `dist/ui.html`:

```ts
// vite.config.ts
import { defineFigmaUiConfig } from 'figma-primitives/vite'

export default defineFigmaUiConfig()
```

Point the Figma manifest at those exact outputs:

```json
{
  "name": "Figma Synth",
  "id": "figma-synth-development",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html",
  "editorType": ["figma"],
  "documentAccess": "dynamic-page"
}
```

Then let `figma-primitives` run both Vite builds from the consuming plugin:

```json
{
  "scripts": {
    "build": "figma-primitives build",
    "dev": "figma-primitives dev"
  }
}
```

`npm run dev` watches the plugin's main and UI source trees. Every change rebuilds `dist/code.js` or `dist/ui.html`, so reopening or rerunning the development plugin in Figma uses the latest output.

## Development

```sh
npm install
npm run check
npm run build
```

- `npm run check` runs TypeScript and the test suite.
- `npm run build` creates ESM JavaScript and type declarations in `dist`.
- `npm run dev` watches source files and rebuilds both JavaScript and type declarations in `dist`.

## Principles

- **Explicit ownership:** async work belongs to a task with one id and one lifecycle.
- **Serializable boundaries:** main/UI messages and layer data stay inspectable.
- **Framework-light core:** React and Vite live behind optional entry points.
- **No hidden product behavior:** applications own their endpoints, schemas, and decisions.

## License

[MIT](./LICENSE)
