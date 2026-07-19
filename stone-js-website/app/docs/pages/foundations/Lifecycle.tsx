import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

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

        <H2>Lifecycle hooks</H2>
        <p>
          Hooks let you run code at precise moments, application startup, shutdown, around each
          event, without threading that code through your handlers. Mark a method with
          <code> @Hook(name)</code>; the kernel calls it at the right time.
        </p>
        <Code file='app/Application.ts'>{`import { Hook, StoneApp } from '@stone-js/core'

@StoneApp({ name: 'tasks' })
export class Application {
  @Hook('onStart')
  async warmUp () { /* open pools, prime caches, once at startup */ }

  @Hook('onTerminate')
  async drain () { /* flush and close, once at shutdown */ }
}`}</Code>
        <p>
          The available moments span the whole life of the app and of each event:
          <code> onInit</code>, <code>onStart</code>, <code>onHandlingEvent</code>,
          <code> onExecutingEventHandler</code>, <code>onExecutingErrorHandler</code>,
          <code> onStop</code> and <code>onTerminate</code>.
        </p>

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
