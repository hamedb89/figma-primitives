import { PluginError } from './errors'
import type { Logger } from './logging'

export type JsonDecoder<T> = (value: unknown) => T
export type NetworkClientOptions = { baseUrl?: string; fetch?: typeof fetch; logger?: Logger; timeoutMs?: number }

export function createNetworkClient(options: NetworkClientOptions = {}) {
  const fetcher = options.fetch ?? globalThis.fetch
  async function request<T>(path: string, init: RequestInit & { decode?: JsonDecoder<T>; timeoutMs?: number } = {}): Promise<T> {
    const controller = new AbortController()
    const onAbort = () => controller.abort(init.signal?.reason)
    init.signal?.addEventListener('abort', onAbort, { once: true })
    const timeout = setTimeout(() => controller.abort('timeout'), init.timeoutMs ?? options.timeoutMs ?? 15_000)
    const url = new URL(path, options.baseUrl).toString()
    options.logger?.log('debug', 'network.request', { context: { method: init.method ?? 'GET', url } })
    try {
      const response = await fetcher(url, { ...init, signal: controller.signal })
      if (!response.ok) throw new PluginError({ code: 'network.http', details: { status: response.status, url }, message: `Request failed with ${response.status}`, recoverable: response.status >= 500 })
      const value: unknown = response.status === 204 ? undefined : await response.json()
      return init.decode ? init.decode(value) : value as T
    } catch (error) {
      if (controller.signal.aborted) throw new PluginError({ code: 'network.aborted', details: { reason: controller.signal.reason, url }, message: 'Request was aborted', recoverable: true })
      throw error
    } finally {
      clearTimeout(timeout)
      init.signal?.removeEventListener('abort', onAbort)
    }
  }
  return { delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }), get: <T>(path: string, init?: RequestInit) => request<T>(path, init), post: <T>(path: string, body: unknown, init?: RequestInit) => request<T>(path, { ...init, body: JSON.stringify(body), headers: { 'content-type': 'application/json', ...init?.headers }, method: 'POST' }), request }
}
