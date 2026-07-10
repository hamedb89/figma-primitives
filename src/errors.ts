export type PluginErrorShape = {
  code: string
  details?: unknown
  message: string
  recoverable: boolean
}

export class PluginError extends Error implements PluginErrorShape {
  readonly code: string
  readonly details?: unknown
  readonly recoverable: boolean

  constructor(shape: PluginErrorShape) {
    super(shape.message)
    this.name = 'PluginError'
    this.code = shape.code
    this.details = shape.details
    this.recoverable = shape.recoverable
  }
}

export function toPluginError(error: unknown, code = 'unknown'): PluginErrorShape {
  if (error instanceof PluginError) return error
  return {
    code,
    message: error instanceof Error ? error.message : String(error),
    recoverable: false,
  }
}
