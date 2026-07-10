import { PluginError } from './errors'

export type CommandDefinition<Request = unknown, Response = unknown> = { request: Request; response: Response }
export type ProtocolDefinition = Record<string, CommandDefinition>
type RequestOf<P extends ProtocolDefinition, K extends keyof P> = P[K]['request']
type ResponseOf<P extends ProtocolDefinition, K extends keyof P> = P[K]['response']
type Envelope = { id?: string; name: string; payload?: unknown; replyTo?: string; error?: string }

export type MessagePort = { post(message: Envelope): void; subscribe(listener: (message: Envelope) => void): () => void }

export function createProtocol<P extends ProtocolDefinition>(port: MessagePort) {
  let sequence = 0
  const handlers = new Map<string, (payload: unknown) => unknown | Promise<unknown>>()
  const pending = new Map<string, { reject(error: unknown): void; resolve(value: unknown): void }>()
  const unsubscribe = port.subscribe(async (message) => {
    if (message.replyTo) {
      const request = pending.get(message.replyTo)
      if (!request) return
      pending.delete(message.replyTo)
      message.error ? request.reject(new PluginError({ code: 'protocol.remote', message: message.error, recoverable: false })) : request.resolve(message.payload)
      return
    }
    const handler = handlers.get(message.name)
    if (!handler || !message.id) return
    try { port.post({ name: message.name, payload: await handler(message.payload), replyTo: message.id }) }
    catch (error) { port.post({ error: error instanceof Error ? error.message : String(error), name: message.name, replyTo: message.id }) }
  })
  return {
    close() { unsubscribe(); pending.forEach(({ reject }) => reject(new Error('Protocol closed'))); pending.clear() },
    handle<K extends keyof P & string>(name: K, handler: (payload: RequestOf<P, K>) => ResponseOf<P, K> | Promise<ResponseOf<P, K>>) { handlers.set(name, handler as (payload: unknown) => unknown); return () => handlers.delete(name) },
    request<K extends keyof P & string>(name: K, payload: RequestOf<P, K>): Promise<ResponseOf<P, K>> { const id = `${name}:${Date.now().toString(36)}:${++sequence}`; return new Promise((resolve, reject) => { pending.set(id, { reject, resolve }); port.post({ id, name, payload }) }) },
  }
}

export function createWindowPort(target: Window, source: Window = window): MessagePort {
  return {
    post: (message) => target.postMessage({ pluginMessage: message }, '*'),
    subscribe(listener) { const handler = (event: MessageEvent<{ pluginMessage?: Envelope }>) => { if (event.data?.pluginMessage) listener(event.data.pluginMessage) }; source.addEventListener('message', handler); return () => source.removeEventListener('message', handler) },
  }
}
