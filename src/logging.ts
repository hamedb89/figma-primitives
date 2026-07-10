export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogRuntime = 'main' | 'ui'
export type LogEntry = {
  context?: Record<string, unknown>
  event: string
  level: LogLevel
  message?: string
  runtime: LogRuntime
  taskId?: string
  timestamp: number
}

export type Logger = {
  entries(): readonly LogEntry[]
  log(level: LogLevel, event: string, context?: Omit<LogEntry, 'event' | 'level' | 'runtime' | 'timestamp'>): void
  subscribe(listener: (entry: LogEntry) => void): () => void
}

export function createLogger(runtime: LogRuntime, maxEntries = 200): Logger {
  let history: LogEntry[] = []
  const listeners = new Set<(entry: LogEntry) => void>()
  return {
    entries: () => history,
    log(level, event, context = {}) {
      const entry: LogEntry = { ...context, event, level, runtime, timestamp: Date.now() }
      history = [...history.slice(-(maxEntries - 1)), entry]
      listeners.forEach((listener) => listener(entry))
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
