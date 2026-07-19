import { StoneBlueprint } from '@stone-js/core'

/** A Web-standard fetch handler `(request, executionContext?) => Promise<Response>`. */
export type FetchHandler = (request: Request, executionContext?: Record<string, unknown>) => Promise<Response>

/**
 * What to boot: the app's modules (decorated classes and/or blueprints). The Fetch adapter is
 * forced as the current adapter, so the same app deploys to any edge/runtime target.
 */
export interface EdgeAppOptions {
  /** App modules to boot. */
  modules?: unknown[]
  /** A base blueprint to merge (shorthand for one blueprint module). */
  blueprint?: Partial<StoneBlueprint>
}
