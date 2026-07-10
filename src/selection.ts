import type { FigmaLayer } from './layers'

export type SelectionSnapshot = { layers: FigmaLayer[]; revision: number }
export function createSelectionStore(initial: SelectionSnapshot = { layers: [], revision: 0 }) {
  let snapshot = initial
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => snapshot,
    setLayers(layers: FigmaLayer[]) { snapshot = { layers, revision: snapshot.revision + 1 }; listeners.forEach((listener) => listener()) },
    subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener) },
  }
}
export type SelectionStore = ReturnType<typeof createSelectionStore>
