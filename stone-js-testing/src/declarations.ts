import { AdapterContext, IncomingEvent, IncomingEventOptions, OutgoingResponse, StoneBlueprint } from '@stone-js/core'

/** Platform identifier for the in-memory test adapter. */
export const TEST_PLATFORM = 'test'

/** The (empty) execution context for the test adapter. */
export type TestExecutionContext = Record<string, unknown>

/** The adapter context for the test adapter. */
export type TestAdapterContext = AdapterContext<
IncomingEvent,
OutgoingResponse,
TestExecutionContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
>

/**
 * Options for {@link createTestApp}.
 */
export interface TestAppOptions {
  /** App modules to boot: decorated classes (`@StoneApp`, controllers, …) and/or blueprints. */
  modules?: unknown[]
  /** A base blueprint to merge in (shorthand for a single blueprint module). */
  blueprint?: Partial<StoneBlueprint>
}
