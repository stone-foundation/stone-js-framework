import { flushSync } from 'react-dom'
import { ReactNode } from 'react'
import { Root as ReactRootInstance } from 'react-dom/client'

/**
 * A document that may expose the View Transitions API.
 */
interface ViewTransitionDocument {
  startViewTransition?: (callback: () => void) => unknown
}

/**
 * Options controlling a transitional render.
 */
export interface RenderWithTransitionOptions {
  /** Whether View Transitions are allowed (default `true`). */
  enabled?: boolean
  /** Whether this render is a client navigation (transitions only wrap navigations, not the first paint/hydration). */
  isNavigation?: boolean
  /** Injected document (defaults to the global). */
  doc?: ViewTransitionDocument
}

/**
 * Renders into a React root, wrapping the update in a View Transition when possible.
 *
 * A transition is used only when: it is enabled, this is a client navigation (not the first
 * render), and the browser supports `document.startViewTransition`. The render is flushed
 * synchronously inside the transition callback so the API can snapshot the new DOM. Otherwise
 * it falls back to a plain render — so SSR, hydration and unsupported browsers are unaffected.
 *
 * @param root - The React root.
 * @param app - The React node to render.
 * @param options - Transition options.
 */
export function renderWithTransition (root: ReactRootInstance, app: ReactNode, options: RenderWithTransitionOptions = {}): void {
  const doc = options.doc ?? (typeof document !== 'undefined' ? (document as ViewTransitionDocument) : undefined)
  const supported = typeof doc?.startViewTransition === 'function'

  if (options.enabled !== false && options.isNavigation === true && supported) {
    doc?.startViewTransition?.(() => { flushSync(() => { root.render(app) }) })
  } else {
    root.render(app)
  }
}
