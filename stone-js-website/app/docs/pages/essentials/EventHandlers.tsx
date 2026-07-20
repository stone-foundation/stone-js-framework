import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/event-handlers'

const DECL = `
import { EventHandler, Get } from '@stone-js/router'
import { IncomingHttpEvent } from '@stone-js/http-core'

@EventHandler('/hello')
export class HelloController {
  @Get('/')
  greet (event: IncomingHttpEvent) {
    return { message: \`Hello \${event.get<string>('name', 'World')}\` }
  }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'

const greet = (event) => ({ message: \`Hello \${event.get('name', 'World')}\` })

export const routes = defineRoutes([
  [defineEventHandler(greet), { path: '/hello', method: 'GET' }]
])
`

/**
 * Essentials: event handlers.
 */
@Page(PATH, { layout: 'docs' })
export class EventHandlers implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Event handlers',
      description: 'The unit of your domain: it receives an intention and returns a result. Written as a class, a factory, or a function.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Event handlers' />
        <Lead>
          A handler is the smallest piece of your domain: it takes an <code>IncomingEvent</code> and
          returns a result. Everything the framework does, from adapters to middleware, exists to
          deliver a clean intention to a handler and carry its result back out.
        </Lead>

        <H2>The contract</H2>
        <p>
          A handler receives the event and returns a value (or a response). It reads inputs with
          <code> event.get()</code> and returns plain data; the context serialises it. That is the
          whole contract, and it is identical in every runtime.
        </p>
        <CodeTabs file='app/Hello.ts' decl={DECL} imp={IMP} />
        <Aphorism>Intention in, result out. A handler never learns which platform delivered the intention.</Aphorism>

        <H2>The three forms</H2>
        <p>
          A handler can be any of the three forms, chosen to fit the job:
        </p>
        <Code file='app/forms.ts'>{`// Class: bindings arrive in the constructor (best with decorators).
@EventHandler('/tasks')
class TaskController { constructor ({ tasks }) { this.tasks = tasks } /* ... */ }

// Factory: receives the container, returns the handler object.
const TaskController = ({ tasks }) => ({ list: () => tasks.list() })

// Function: bare logic, no container. Perfect for tiny endpoints.
const ping = (event) => ({ pong: event.get('n', 1) })`}</Code>

        <H3>Multiple handlers</H3>
        <p>
          A minimal app has one handler. Add <code>@Routing()</code> and you can have as many as you
          like, each bound to its own intention; the router delegates the right event to the right
          handler. See the Routing section for the full story.
        </p>

        <Callout kind='note' title='Handlers stay pure'>
          Keep handlers thin: read the intention, call a service, return data. Push logic into
          services (injected via the container) and cross-cutting concerns into middleware, so the
          handler reads as a statement of intent.
        </Callout>

        <SeeAlso links={[
          { title: 'Incoming event', path: '/docs/essentials/incoming-event' },
          { title: 'Outgoing response', path: '/docs/essentials/outgoing-response' },
          { title: 'The three forms', path: '/docs/foundations/forms' },
          { title: 'Routing', path: '/docs/routing' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
