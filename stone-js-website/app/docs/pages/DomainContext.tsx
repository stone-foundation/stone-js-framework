import { JSX } from 'react'
import { CodeTabs } from '../components/Code'
import { siblings } from '../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Pager } from '../components/content'

const PATH = '/docs/foundations/domain-context'

const DECL = `
import { Get, EventHandler } from '@stone-js/router'

// Pure domain. No request, no response, no platform.
@EventHandler('/tasks')
export class Tasks {
  constructor ({ store }) { this.store = store }

  @Get('/')
  list () { return this.store.all() }

  @Get('/:id')
  show (event) { return this.store.find(event.get('id')) }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'

// Pure domain, as functions.
const Tasks = ({ store }) => ({
  list: () => store.all(),
  show: (event) => store.find(event.get('id'))
})

export const routes = defineRoutes([
  [defineEventHandler(Tasks, 'list'), { path: '/tasks', method: 'GET' }],
  [defineEventHandler(Tasks, 'show'), { path: '/tasks/:id', method: 'GET' }]
])
`

/**
 * Foundations: separating the domain from the context.
 */
@Page(PATH, { layout: 'docs' })
export class DomainContext implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Domain × Context → Resolution',
      description: 'The discipline at the heart of the Continuum: keep the domain pure, let the context arrive, and let the framework resolve them.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='Domain × Context → Resolution' />
        <Lead>
          The equation is not decoration. It is a discipline you can apply on any project, in any
          language: name what is yours, name what is the platform's, and refuse to let the second
          leak into the first.
        </Lead>

        <H2>Read the equation</H2>
        <Principle
          principle={
            <>
              <p>
                <strong>Domain</strong> is the multiplicand you own: entities, rules, use cases.
                <strong> Context</strong> is the multiplier you inherit: runtime, transport, input
                and output shapes. <strong>Resolution</strong> is the product: a concrete response,
                here and now.
              </p>
              <p>
                It is a product, not a sum, because the domain is expressed <em>through</em> the
                context, once per event. Change the context and you get a different resolution of
                the same domain, not a different application.
              </p>
            </>
          }
          incarnation={
            <>
              <p>
                In Stone.js the domain is your handlers and services. The context is an
                <code> IncomingEvent</code> produced by an adapter plus an ephemeral container. The
                resolution is what the kernel returns after applying one to the other.
              </p>
              <p>
                You never construct the context. You receive it. That single constraint is what
                keeps the domain portable.
              </p>
            </>
          }
        />

        <H2>Keeping the domain pure</H2>
        <p>
          Here is the rule that makes the equation real: a handler receives an intention, never a
          platform. It reads values from an event; it does not know if that event came from an
          HTTP request, a CLI invocation, a browser navigation or an agent call.
        </p>
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />
        <p>
          Nothing in that code names a server. Give it a Node adapter and it is a REST API; give it
          an MCP adapter and the same two methods become tools an agent can call. The domain did
          not change; the context did.
        </p>

        <Callout kind='note' title='The dependency arrow points inward'>
          Services arrive through the container, injected into the domain. The domain never reaches
          out to fetch its dependencies or its context. Everything flows toward the domain, which is
          why the domain can stay ignorant of everything around it.
        </Callout>

        <Callout kind='future' title='One domain, many resolutions, at once'>
          Because context is a multiplier resolved late, a single domain can be resolved by several
          contexts in the same deployment. That is not a trick bolted on top; it falls straight out
          of the equation, and it is what the next page, the uncertainty principle, is about.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
