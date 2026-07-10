# figma-primitives

Small, typed primitives for building Figma plugins with TypeScript, React, and Vite.

It provides the seams shared by most plugins without imposing product behavior:

- request/response messaging between plugin main and UI
- exact task ownership, progress, cancellation, and errors
- serializable `FigmaLayer` projections and selection state
- abortable JSON networking with timeouts and decoders
- structured main/UI logging
- React task, selection, tab, and layer-picker bindings
- reusable Vite configurations for `code.js` and UI builds

```ts
import { createLogger, createTaskEngine } from 'figma-primitives'

const logger = createLogger('ui')
const tasks = createTaskEngine({ logger })

await tasks.run(
  { type: 'selection.inspect', label: 'Inspect selection' },
  ({ id, signal }) => protocol.request('selection.inspect', { taskId: id, signal }),
)
```

The library deliberately does not include endpoints, domain schemas, synthesis, fixture bindings, or other application-specific behavior.

## Development

```sh
npm install
npm run check
npm run build
```

Package exports are available from `figma-primitives`, `figma-primitives/react`, and `figma-primitives/vite`.
