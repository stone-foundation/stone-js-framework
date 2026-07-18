import { NAVIGATION_EVENT } from '@stone-js/router'

/**
 * Options for scroll restoration.
 */
export interface ScrollRestorationOptions {
  /** Whether scroll restoration is enabled (default `true`). */
  enabled?: boolean
  /** Injected window (defaults to the global). */
  win?: Window
}

/**
 * Sets up SPA scroll restoration and returns a teardown function.
 *
 * Behaviour (standard SPA semantics):
 * - takes manual control (`history.scrollRestoration = 'manual'`);
 * - continuously remembers the scroll position of the current history entry;
 * - on a forward navigation (router `NAVIGATION_EVENT`): scrolls to the URL hash target if any,
 *   otherwise to the top;
 * - on back/forward (`popstate`): restores the remembered position, or the top if unknown.
 *
 * All scroll changes are deferred to the next frame so they run after the (possibly
 * transitioned) DOM update. No-op outside the browser or when disabled.
 *
 * @param options - Scroll restoration options.
 * @returns A teardown function removing the listeners.
 */
export function setupScrollRestoration (options: ScrollRestorationOptions = {}): () => void {
  const win = options.win ?? (typeof window !== 'undefined' ? window : undefined)

  if (options.enabled === false || win === undefined) {
    return () => {}
  }

  const positions = new Map<string, [number, number]>()
  let currentKey = keyOf(win)

  if (win.history.scrollRestoration !== undefined) {
    win.history.scrollRestoration = 'manual'
  }

  const onScroll = (): void => { positions.set(currentKey, [win.scrollX, win.scrollY]) }

  const onNavigate = (): void => {
    currentKey = keyOf(win)
    defer(win, () => scrollToTarget(win))
  }

  const onPopstate = (): void => {
    currentKey = keyOf(win)
    const saved = positions.get(currentKey)
    defer(win, () => win.scrollTo(saved?.[0] ?? 0, saved?.[1] ?? 0))
  }

  win.addEventListener('scroll', onScroll, { passive: true })
  win.addEventListener('popstate', onPopstate)
  win.addEventListener(NAVIGATION_EVENT, onNavigate)

  return () => {
    win.removeEventListener('scroll', onScroll)
    win.removeEventListener('popstate', onPopstate)
    win.removeEventListener(NAVIGATION_EVENT, onNavigate)
  }
}

/**
 * The history-entry key used to remember a scroll position.
 */
function keyOf (win: Window): string {
  return (win.history.state?.path as string) ?? win.location.href
}

/**
 * Scrolls to the current URL hash target if present, otherwise to the top.
 */
function scrollToTarget (win: Window): void {
  const hash = win.location.hash
  const element = hash.length > 1 ? win.document.getElementById(hash.slice(1)) : null

  if (element !== null) {
    element.scrollIntoView()
  } else {
    win.scrollTo(0, 0)
  }
}

/**
 * Defers a callback to the next frame (or a microtask when rAF is unavailable).
 */
function defer (win: Window, callback: () => void): void {
  if (typeof win.requestAnimationFrame === 'function') {
    win.requestAnimationFrame(callback)
  } else {
    setTimeout(callback, 0)
  }
}
