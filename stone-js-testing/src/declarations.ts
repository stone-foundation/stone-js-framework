import { TestBindings } from './bindingsProvider'
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
  /**
   * App modules to boot: decorated classes (`@StoneApp`, controllers, …) and/or blueprints.
   *
   * Omit it and they are discovered from `app/**`, the same files the CLI builds. Pass it to boot
   * exactly what you name, for a test that deliberately runs a slice of the application.
   */
  modules?: unknown[]

  /** The application directory to discover modules from. Defaults to `app`. Ignored when `modules` is given. */
  appDir?: string

  /** The glob to discover modules with, overriding `appDir`. Ignored when `modules` is given. */
  pattern?: string

  /**
   * The env file to load before booting. Defaults to `.env.test`; a missing file is not an error.
   * Pass `false` to load none.
   */
  envFile?: string | false

  /**
   * Container bindings to substitute, by alias: a fake repository, a fixed clock, a provider made to
   * fail. Bound after the application's own registrations, so the substitution wins.
   */
  bindings?: TestBindings

  /** A base blueprint to merge in (shorthand for a single blueprint module). */
  blueprint?: Partial<StoneBlueprint>
}
