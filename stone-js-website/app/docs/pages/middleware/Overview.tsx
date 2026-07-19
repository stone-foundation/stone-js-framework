import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/middleware'

const DECL = `
import { Middleware, NextPipe } from '@stone-js/core'
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

@Middleware()
export class Timing {
  async handle (event: IncomingHttpEvent, next: NextPipe<IncomingHttpEvent, OutgoingHttpResponse>) {
    const started = performance.now()
    const response = await next(event)                 // in: continue toward the handler
    response.setHeader('x-time', String(performance.now() - started))
    return response                                    // out: act on the way back
  }
}
`

const IMP = `
import { defineMiddleware } from '@stone-js/core'

export const timing = defineMiddleware(async (event, next) => {
  const started = performance.now()
  const response = await next(event)
  response.setHeader('x-time', String(performance.now() - started))
  return response
})
`

/**
 * Middleware: overview (the pipe model).
 */
@Page(PATH, { layout: 'docs' })
export class Overview implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Middleware',
      description: 'Every event flows through a pipeline of middleware on its way to a handler. Learn the pipe model, then define, register and terminate.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Middleware' title='Middleware' />
        <Lead>
          Middleware is the path to a handler made programmable. Each step can inspect the event, pass
          it inward, and act on the response coming back. It is the same chain of responsibility that
          builds the manifest, now applied to requests, and it is where auth, validation and logging
          live.
        </Lead>

        <H2>The pipe model</H2>
        <p>
          A middleware receives the event and a <code>next</code> function. Everything before
          <code> next(event)</code> is the way in; call it to continue toward the handler; everything
          after is the way out, acting on the response. Return early, without calling <code>next</code>,
          to short-circuit.
        </p>
        <CodeTabs file='app/middleware/Timing.ts' decl={DECL} imp={IMP} />
        <Aphorism>Before next(): the way in. After next(): the way out. Skip next(): the request stops here.</Aphorism>

        <H2>What the section covers</H2>
        <SeeAlso links={[
          { title: 'Defining middleware', path: '/docs/middleware/defining' },
          { title: 'Registering middleware', path: '/docs/middleware/registering' },
          { title: 'Terminating & response middleware', path: '/docs/middleware/terminating' }
        ]} />

        <Callout kind='note' title='The recipes are just middleware'>
          <code>requireAuth()</code>, <code>authorize(...)</code> and <code>validate(...)</code> from
          the Build section all return middleware. Once you know the pipe, you know how every guard in
          Stone.js works.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
