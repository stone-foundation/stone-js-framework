import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/hooks'

/**
 * Essentials: hooks (practical).
 */
@Page(PATH, { layout: 'docs' })
export class Hooks implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Hooks & lifecycle',
      description: 'Run code at precise moments in the app and event lifecycle, startup, shutdown, around each event, without threading it through your handlers.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Hooks & lifecycle' />
        <Lead>
          Some work has to happen at a specific moment, not in response to a request: open a pool at
          startup, flush it at shutdown, observe every event as it passes. Hooks give you those
          moments by name, so that code lives where it belongs instead of leaking into handlers.
        </Lead>

        <H2>Declaring a hook</H2>
        <p>
          Mark a method with <code>@Hook(name)</code>. The kernel calls it at the matching moment,
          with the app's dependencies available. Startup and shutdown hooks fire once; per-event hooks
          fire inside each ephemeral container.
        </p>
        <Code file='app/Application.ts'>{`import { Hook, StoneApp } from '@stone-js/core'

@StoneApp({ name: 'tasks' })
export class Application {
  @Hook('onStart')
  async warmUp ({ container }) {
    await container.resolve('db').connect()   // once, at startup
  }

  @Hook('onTerminate')
  async drain ({ container }) {
    await container.resolve('db').close()      // once, at shutdown
  }
}`}</Code>

        <H2>The lifecycle moments</H2>
        <PropsTable nameHeader='Hook' rows={[
          { name: 'onInit', type: 'process', desc: 'The app is being initialised, before it starts.' },
          { name: 'onStart', type: 'process', desc: 'The app has started; warm long-lived resources here.' },
          { name: 'onHandlingEvent', type: 'per event', desc: 'An event is about to be handled.' },
          { name: 'onExecutingEventHandler', type: 'per event', desc: 'The handler is about to run.' },
          { name: 'onExecutingErrorHandler', type: 'per event', desc: 'An error handler is about to run.' },
          { name: 'onStop', type: 'process', desc: 'The app is stopping.' },
          { name: 'onTerminate', type: 'process', desc: 'Final teardown; flush and close.' }
        ]} />

        <H2>Imperative hooks</H2>
        <Code file='app/hooks.ts'>{`import { defineHookListener } from '@stone-js/core'

export const hooks = [
  defineHookListener('onStart', ({ container }) => container.resolve('db').connect())
]`}</Code>

        <Callout kind='note' title='Hook or middleware?'>
          Use a hook for lifecycle moments (startup, shutdown, cross-event observation). Use middleware
          to participate in handling a specific event (guarding, transforming). Reaching for the wrong
          one is the usual source of confusion; keep the two roles distinct.
        </Callout>

        <SeeAlso links={[
          { title: 'Lifecycle & the kernel', path: '/docs/foundations/lifecycle' },
          { title: 'Middleware & the pipeline', path: '/docs/foundations/middleware' },
          { title: 'Events & listeners', path: '/docs/essentials/events' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
