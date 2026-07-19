import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/foundations/middleware'

const DECL = `
import { Middleware, NextPipe } from '@stone-js/core'
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

@Middleware()
export class Timing {
  async handle (event: IncomingHttpEvent, next: NextPipe<IncomingHttpEvent, OutgoingHttpResponse>) {
    const started = performance.now()
    const response = await next(event)          // pass control inward
    response.setHeader('x-time', String(performance.now() - started))
    return response                             // ...then act on the way out
  }
}
`

const IMP = `
import { defineMiddleware } from '@stone-js/core'

export const timing = defineMiddleware(async (event, next) => {
  const started = performance.now()
  const response = await next(event)            // pass control inward
  response.setHeader('x-time', String(performance.now() - started))
  return response                               // ...then act on the way out
})
`

/**
 * Foundations: middleware and the pipeline.
 */
@Page(PATH, { layout: 'docs' })
export class Middleware implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Middleware & the pipeline',
      description: 'Every event flows through a pipeline of middleware on its way to a handler. It is the chain of responsibility, applied to requests.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='Middleware & the pipeline' />
        <Lead>
          On its way to a handler, every event passes through a pipeline: an ordered chain of steps,
          each able to inspect the event, pass it inward, and then act on the response coming back.
          This is the same chain of responsibility that builds the manifest, now applied to requests.
        </Lead>

        <H2>A pipe, in and out</H2>
        <Principle
          principle={
            <p>
              Cross-cutting concerns, auth, validation, logging, timing, do not belong inside your
              business logic, but they do belong on the path to it. A pipeline gives each concern a
              place on that path, with control over what continues and what comes back.
            </p>
          }
          incarnation={
            <p>
              A Stone.js middleware is a pipe: it receives the event and a <code>next</code> function.
              Call <code>next(event)</code> to continue toward the handler; what you do before is the
              way in, what you do with its result is the way out. Return early to short-circuit.
            </p>
          }
        />
        <CodeTabs file='app/middleware/Timing.ts' decl={DECL} imp={IMP} />
        <Aphorism>Everything before next() is the way in. Everything after is the way out. Skip next() and the request stops here.</Aphorism>

        <H2>Where middleware attaches</H2>
        <ul>
          <li><strong>Globally</strong>: on the Blueprint (<code>stone.middleware</code>), for every event.</li>
          <li><strong>Per route or handler</strong>: in the route's <code>middleware</code> option, for just those intentions.</li>
        </ul>
        <p>
          Auth, authorization and validation from the Build section are all just middleware: <code>requireAuth()</code>, <code>authorize(...)</code> and <code>validate(...)</code> return pipes that sit on the path to your method.
        </p>

        <Callout kind='future' title='One pattern, everywhere'>
          The build phase composed the manifest with a pipeline; the kernel handles events with a
          pipeline; adapters normalise causes with pipelines. Learn the pipe once and you have read
          the framework's control flow from setup to response.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
