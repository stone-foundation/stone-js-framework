import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { Lifecycle as LifecycleDiagram, APP_LIFECYCLE, REQUEST_LIFECYCLE } from '../../components/Lifecycle'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/foundations/lifecycle'

/**
 * Foundations: lifecycle and the kernel.
 */
@Page(PATH, { layout: 'docs' })
export class Lifecycle implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Lifecycle & the kernel',
      description: 'The kernel applies the domain to each intention. Lifecycle hooks let you run code at precise moments without touching the flow.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='Lifecycle & the kernel' />
        <Lead>
          The kernel is the initialization dimension: the part that takes a normalised intention and
          applies your domain to it, once per event, inside a fresh container. It knows nothing of
          any platform, and it is where the request's short life plays out.
        </Lead>

        <H2>What the kernel does</H2>
        <Principle
          principle={
            <p>
              Between "a request arrived" and "a response left" there is a fixed sequence: build a
              scope, run the middleware, invoke the handler, handle errors, produce a response.
              Naming that sequence, and keeping it platform-agnostic, is what lets one flow serve
              every runtime.
            </p>
          }
          incarnation={
            <p>
              The kernel receives an <code>IncomingEvent</code> from an adapter, creates the per-event
              container, sends the event through the middleware pipeline to the resolved handler, maps
              the result (or an error) to a response, and returns it to the adapter. Every context
              reuses this exact kernel.
            </p>
          }
        />
        <Aphorism>The adapter says what happened. The kernel decides what to do about it. Your domain says what it means.</Aphorism>

        <H2>The application lifecycle</H2>
        <p>
          There are two timelines. The first runs once: the app is built, collapses to one context at
          run time, starts, serves events, and terminates. The long-lived adapter is the only thing
          that persists across events.
        </p>
        <LifecycleDiagram stages={APP_LIFECYCLE} caption='Startup to shutdown, once per process.' />

        <H2>The per-event lifecycle</H2>
        <p>
          The second timeline runs for every cause: from the raw platform event to the native effect,
          inside a fresh container that is created and discarded per event. The pills mark the hooks
          that fire at each step.
        </p>
        <LifecycleDiagram stages={REQUEST_LIFECYCLE} caption='One intention, from cause to effect.' />

        <H2>Lifecycle hooks</H2>
        <p>
          Hooks let you run code at the precise moments above, application startup, shutdown, and
          around each event, without threading that code through your handlers. Mark a method with
          <code> @Hook(name)</code> and the kernel calls it at the right time.
        </p>
        <CodeTabs
          file='app/Application.ts'
          decl={`import { Hook, StoneApp } from '@stone-js/core'

@StoneApp({ name: 'tasks' })
export class Application {
  @Hook('onStart')
  async warmUp () { /* open pools, prime caches, once at startup */ }

  @Hook('onTerminate')
  async drain () { /* flush and close, once at shutdown */ }
}`}
          imp={`import { defineHookListener } from '@stone-js/core'

// The same two moments, registered imperatively as a list of hook listeners.
export const hooks = [
  defineHookListener('onStart', () => { /* open pools, prime caches, once at startup */ }),
  defineHookListener('onTerminate', () => { /* flush and close, once at shutdown */ })
]`}
        />

        <H3>Two scopes, dimension-bound</H3>
        <p>
          Hooks are scoped to the dimension they observe, which sorts them into two lifetimes:
        </p>
        <ul>
          <li><strong>Global hooks</strong> fire once over the app's lifetime (<code>onInit</code>, <code>onStart</code>, <code>onTerminate</code>), plus the setup pair around the Blueprint (<code>onPreparingBlueprint</code>, <code>onBlueprintPrepared</code>). They live with the long-lived adapter.</li>
          <li><strong>Per-intent hooks</strong> fire for every event, inside its ephemeral container (<code>onHandlingEvent</code>, <code>onProcessingKernelMiddleware</code>, <code>onExecutingEventHandler</code>, <code>onEventHandled</code>, <code>onExecutingErrorHandler</code>, <code>onPreparingResponse</code>), from the moment the context is created to when the response is sent and it is torn down.</li>
        </ul>
        <Aphorism>Hooks exist to observe the lifecycle, not to alter it. To change what happens to an event, use middleware.</Aphorism>

        <Callout kind='note' title='Hooks are not middleware'>
          Use a hook for lifecycle moments (startup, shutdown, observation). Use middleware to
          participate in handling a specific event (guarding, transforming). The next page is about
          middleware; keep the two roles distinct.
        </Callout>

        <Callout kind='future' title='Long-lived vs per-event, again'>
          <code>onStart</code>/<code>onTerminate</code> fire once, in the long-lived adapter's life;
          the per-event hooks fire inside each ephemeral container. The lifecycle makes the two time
          scales, the process and the request, explicit and separately addressable.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
