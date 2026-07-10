import { createContext, createElement, useContext, useSyncExternalStore, type ReactNode } from 'react'
import type { FigmaLayer, FigmaLayerCapability } from '../layers'
import type { SelectionStore } from '../selection'
import type { TaskEngine } from '../tasks'

const TaskContext = createContext<TaskEngine | null>(null)
export function TaskProvider(props: { children: ReactNode; engine: TaskEngine }) { return createElement(TaskContext.Provider, { value: props.engine }, props.children) }
export function useTaskEngine() { const engine = useContext(TaskContext); if (!engine) throw new Error('useTaskEngine requires TaskProvider'); return engine }
export function useTasks() { const engine = useTaskEngine(); return useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot) }
export function useSelection(store: SelectionStore) { return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot) }

export function Tabs<T extends string>(props: { active: T; items: Array<{ id: T; label: string }>; onChange(id: T): void }) {
  return createElement('nav', { 'aria-label': 'Plugin sections', role: 'tablist' }, props.items.map((item) => createElement('button', { 'aria-selected': props.active === item.id, key: item.id, onClick: () => props.onChange(item.id), role: 'tab', type: 'button' }, item.label)))
}

export function SelectLayer(props: { capability?: FigmaLayerCapability; layers: FigmaLayer[]; onChange(id: string): void; value?: string }) {
  const layers = flatten(props.layers).filter((layer) => !props.capability || layer.capabilities[props.capability])
  return createElement('select', { 'aria-label': 'Select layer', onChange: (event: Event) => props.onChange((event.currentTarget as HTMLSelectElement).value), value: props.value ?? '' }, [createElement('option', { key: '', value: '' }, 'Select a layer'), ...layers.map((layer) => createElement('option', { key: layer.id, value: layer.id }, layer.name))])
}
function flatten(layers: FigmaLayer[]): FigmaLayer[] { return layers.flatMap((layer) => [layer, ...flatten(layer.children ?? [])]) }
