import { toPluginError, type PluginErrorShape } from './errors'
import type { Logger } from './logging'

export type TaskStatus = 'running' | 'success' | 'error' | 'cancelled'
export type TaskProgress = { current?: number; label: string; total?: number }
export type PluginTask = {
  blocking: boolean
  error?: PluginErrorShape
  finishedAt?: number
  id: string
  label: string
  progress?: TaskProgress
  startedAt: number
  status: TaskStatus
  type: string
}
export type TaskRunContext = { id: string; progress(value: TaskProgress): void; signal: AbortSignal }

export function createTaskEngine(options: { logger?: Logger; maxTasks?: number } = {}) {
  let sequence = 0
  let tasks: PluginTask[] = []
  const controllers = new Map<string, AbortController>()
  const listeners = new Set<(tasks: readonly PluginTask[]) => void>()
  const emit = () => listeners.forEach((listener) => listener(tasks))
  const update = (id: string, patch: Partial<PluginTask>) => {
    tasks = tasks.map((task) => task.id === id ? { ...task, ...patch } : task)
    emit()
  }

  async function run<T>(definition: { blocking?: boolean; label: string; type: string }, work: (context: TaskRunContext) => Promise<T>): Promise<T> {
    const id = `${definition.type}:${Date.now().toString(36)}:${++sequence}`
    const controller = new AbortController()
    controllers.set(id, controller)
    const task: PluginTask = { blocking: definition.blocking ?? true, id, label: definition.label, startedAt: Date.now(), status: 'running', type: definition.type }
    tasks = [...tasks, task]
      .slice(-(options.maxTasks ?? 32))
    options.logger?.log('info', 'task.started', { context: { type: definition.type }, taskId: id })
    emit()
    try {
      const result = await work({ id, signal: controller.signal, progress: (progress) => update(id, { progress }) })
      update(id, { finishedAt: Date.now(), status: 'success' })
      options.logger?.log('info', 'task.completed', { taskId: id })
      return result
    } catch (error) {
      const cancelled = controller.signal.aborted
      update(id, { error: cancelled ? undefined : toPluginError(error), finishedAt: Date.now(), status: cancelled ? 'cancelled' : 'error' })
      options.logger?.log(cancelled ? 'info' : 'error', cancelled ? 'task.cancelled' : 'task.failed', { context: cancelled ? undefined : { error: toPluginError(error) }, taskId: id })
      throw error
    } finally {
      controllers.delete(id)
    }
  }

  return {
    cancel(id: string) { controllers.get(id)?.abort() },
    getSnapshot: () => tasks as readonly PluginTask[],
    run,
    subscribe(listener: (tasks: readonly PluginTask[]) => void) { listeners.add(listener); return () => listeners.delete(listener) },
  }
}

export type TaskEngine = ReturnType<typeof createTaskEngine>
