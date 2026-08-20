import { HeadContext } from '@stone-js/use-view'
import { useEffect } from 'react'
import { ReactRuntime } from './ReactRuntime'
import { useContainer } from '@stone-js/use-react-core'

/**
 * The two hooks that need the web runtime.
 *
 * Every other hook is platform-independent and lives in `@stone-js/use-react-core`, from
 * where this package re-exports it: your imports do not change. These two stay because the
 * runtime they reach for applies a head to a live `document` and mounts error components
 * with `react-dom`, neither of which exists on a native platform. A native renderer ships
 * its own runtime under the same `reactRuntime` alias, and its own pair of hooks.
 */

/**
 * Access the React runtime (snapshots, head application, error rendering).
 *
 * @returns The React runtime.
 */
export function useRuntime (): ReactRuntime {
  return useContainer().make<ReactRuntime>('reactRuntime')
}

/**
 * Apply a head context (title, metas, links, JSON-LD, …) from within a component.
 *
 * The head is applied to the live document after paint (client only); during SSR/SSG the
 * effect never runs, so the head must also be returned from the page's `head()` for the
 * server-rendered markup. Re-applies whenever `head` changes.
 *
 * @param head - The head context to apply.
 */
export function useHead (head: HeadContext): void {
  const runtime = useRuntime()
  useEffect(() => {
    if (typeof document !== 'undefined') { runtime.head(head) }
  }, [head])
}
