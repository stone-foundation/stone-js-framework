import { JSX } from 'react'

/** One stage on a lifecycle timeline. */
export interface Stage {
  /** Dimension label, e.g. "Integration · adapter". */
  phase: string
  title: string
  detail: string
  /** Hook names that fire at this stage (rendered as mono pills). */
  hooks?: string[]
  /** Highlight the run-time contextual collapse. */
  collapse?: boolean
}

/**
 * The application lifecycle, from startup to shutdown. Stages and hook names are
 * taken from the core (`@stone-js/core`); the collapse is the run-time adapter
 * resolution performed by StoneFactory.run().
 */
export const APP_LIFECYCLE: Stage[] = [
  { phase: 'Setup · once', title: 'Build the Blueprint', detail: 'Discovered decorators and define* modules compose the single manifest, once, before any event. Then it freezes.', hooks: ['onPreparingBlueprint', 'onBlueprintPrepared'] },
  { phase: 'Initialization', title: 'Initialize', detail: 'The container comes up and providers register; the app is wired but not yet listening.', hooks: ['onInit'] },
  { phase: 'Integration', title: 'Collapse to one context', detail: 'StoneFactory.run() resolves a single adapter from the stack: the one whose alias matches the platform, else the default, else the only one. This is the contextual collapse.', collapse: true },
  { phase: 'Integration', title: 'Start & listen', detail: 'The resolved adapter (the only long-lived thing) starts and begins accepting causes.', hooks: ['onStart'] },
  { phase: 'Functional · per event', title: 'Handle events', detail: 'For every cause, the per-event cycle runs (below), then repeats for the life of the process.' },
  { phase: 'Shutdown · once', title: 'Terminate', detail: 'On shutdown the app drains and closes; the adapter stops.', hooks: ['onTerminate'] }
]

/**
 * The incoming-event lifecycle, from a raw platform cause to a native effect,
 * with every hook the kernel and adapter fire along the way.
 */
export const REQUEST_LIFECYCLE: Stage[] = [
  { phase: 'Integration · adapter', title: 'Capture the raw cause', detail: 'The long-lived adapter receives the platform’s raw event: an HTTP request, a message, an argv, an agent call.' },
  { phase: 'Integration · adapter', title: 'Adapter middleware', detail: 'Runs on the raw cause and response, around the kernel call, for boundary concerns.', hooks: ['onProcessingAdapterMiddleware', 'onAdapterMiddlewareProcessed'] },
  { phase: 'Integration · adapter', title: 'Normalise to an intention', detail: 'The adapter builds an IncomingEvent: transport-agnostic, the form the domain reads.', hooks: ['onBuildingIncomingEvent'] },
  { phase: 'Initialization · kernel', title: 'Fresh ephemeral container', detail: 'The kernel creates a container for this one event and resolves handlers and services into it.', hooks: ['onHandlingEvent'] },
  { phase: 'Initialization · kernel', title: 'Kernel middleware pipeline', detail: 'The event flows through the middleware chain, where validation, auth and authorization attach.', hooks: ['onProcessingKernelMiddleware', 'onKernelMiddlewareProcessed'] },
  { phase: 'Functional · your domain', title: 'Run the handler', detail: 'The resolved handler runs and returns a value (or throws). This is your code.', hooks: ['onExecutingEventHandler', 'onEventHandled'] },
  { phase: 'Initialization · kernel', title: 'On error, map it', detail: 'A thrown error is routed to the matching error handler and mapped to a response.', hooks: ['onExecutingErrorHandler', 'onHandlingAdapterError'] },
  { phase: 'Initialization · kernel', title: 'Prepare the response', detail: 'The result (or mapped error) becomes an OutgoingResponse; terminating middleware runs.', hooks: ['onPreparingResponse', 'onResponsePrepared'] },
  { phase: 'Integration · adapter', title: 'Emit the native effect', detail: 'The adapter turns the response into the platform’s native effect; the ephemeral container is discarded.', hooks: ['onBuildingRawResponse'] }
]

/**
 * A vertical lifecycle timeline: a braise spine, one node per stage, the dimension
 * as an eyebrow, and the hooks that fire as mono pills. The run-time collapse is
 * highlighted. Theme-aware and responsive by construction (single column).
 */
export function Lifecycle ({ stages, caption }: { stages: Stage[], caption?: string }): JSX.Element {
  return (
    <figure className='lifecycle'>
      <ol className='lc-track'>
        {stages.map((s, i) => (
          <li key={i} className={`lc-stage ${s.collapse === true ? 'is-collapse' : ''}`}>
            <span className='lc-rail'><span className='lc-node' aria-hidden='true' /></span>
            <div className='lc-body'>
              <p className='lc-phase'>
                {s.phase}
                {s.collapse === true && <span className='lc-tag'>run time</span>}
              </p>
              <h4 className='lc-title'>{s.title}</h4>
              <p className='lc-detail'>{s.detail}</p>
              {s.hooks !== undefined && s.hooks.length > 0 && (
                <div className='lc-hooks'>
                  {s.hooks.map((h) => <code key={h} className='lc-hook'>{h}</code>)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      {caption !== undefined && <figcaption className='lc-caption'>{caption}</figcaption>}
    </figure>
  )
}
