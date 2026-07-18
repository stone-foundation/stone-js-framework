import { createElement as reactCreateElement, ReactNode } from 'react'
import { ViewEngine, ViewRoot, StreamRenderOptions } from '@stone-js/use-view'

/**
 * React implementation of the agnostic `ViewEngine` contract from `@stone-js/use-view`.
 *
 * This is the single seam between Stone.js's universal rendering layer and React: everything
 * React-specific (createElement, react-dom/server, react-dom/client) lives here, so a future
 * `@stone-js/use-vue` only needs to provide its own `ViewEngine`. It supports buffered SSR
 * (`renderToString`), streaming SSR (`renderToStream`, React 19 `renderToReadableStream`,
 * runtime-agnostic Web `ReadableStream`), client mount and hydration.
 */

const encoder = new TextEncoder()

/**
 * Wrap a React output stream with a head prefix and a tail suffix, producing a single
 * Web `ReadableStream` for the full document. The prefix (open tags + serialized head) is
 * flushed first for fast TTFB, then the app shell streams, then the tail (hydration snapshot
 * + closing tags).
 *
 * @param head - Markup emitted before the app shell.
 * @param stream - The React-produced Web stream.
 * @param tail - Markup emitted after the app shell.
 * @returns A combined Web ReadableStream.
 */
function wrapStream (head: string | undefined, stream: ReadableStream<Uint8Array>, tail: string | undefined): ReadableStream<Uint8Array> {
  const reader = stream.getReader()
  return new ReadableStream<Uint8Array>({
    async start (controller) {
      try {
        if (head !== undefined && head.length > 0) { controller.enqueue(encoder.encode(head)) }
        while (true) {
          const { done, value } = await reader.read()
          if (done) { break }
          if (value !== undefined) { controller.enqueue(value) }
        }
        if (tail !== undefined && tail.length > 0) { controller.enqueue(encoder.encode(tail)) }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
    cancel (reason) {
      void reader.cancel(reason)
    }
  })
}

/**
 * The React view engine. Passed to the universal renderer; also usable directly.
 */
export const ReactViewEngine: ViewEngine<ReactNode, ViewRoot> = {
  createElement (component, props, ...children) {
    return reactCreateElement(component as Parameters<typeof reactCreateElement>[0], props ?? null, ...children)
  },

  async renderToString (node) {
    // Lazily imported so react-dom/server never lands in the client bundle.
    const { renderToString } = await import('react-dom/server')
    return renderToString(node)
  },

  async renderToStream (node, options: StreamRenderOptions = {}) {
    const { renderToReadableStream } = await import('react-dom/server')
    const stream = await renderToReadableStream(node, {
      bootstrapModules: options.bootstrapModules,
      signal: options.signal,
      nonce: options.nonce,
      onError: options.onShellError
    })
    options.onShellReady?.()
    return wrapStream(options.head, stream, options.tail)
  },

  async mount (node, container) {
    // Lazily imported so react-dom/client is only pulled where needed (client-side).
    return await lazyClientRoot(node, container, false)
  },

  async hydrate (node, container) {
    return await lazyClientRoot(node, container, true)
  }
}

/**
 * Create (or hydrate) a client React root, returning a {@link ViewRoot} handle once the
 * client runtime has loaded.
 *
 * @param node - The React node to render.
 * @param container - The DOM container.
 * @param hydrate - Whether to hydrate server markup or mount fresh.
 * @returns A promise resolving to a ViewRoot handle.
 */
async function lazyClientRoot (node: ReactNode, container: Element, hydrate: boolean): Promise<ViewRoot> {
  const { createRoot, hydrateRoot } = await import('react-dom/client')
  const root = hydrate
    ? hydrateRoot(container, node)
    : (() => { const r = createRoot(container); r.render(node); return r })()

  return {
    update (next) { root.render(next as ReactNode) },
    unmount () { root.unmount() }
  }
}
