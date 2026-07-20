import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/middleware/terminating'

/**
 * Middleware: terminating & response middleware.
 */
@Page(PATH, { layout: 'docs' })
export class Terminating implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Terminating & response middleware',
      description: 'Do work after the response is ready: shape it, add headers, or run cleanup, all on the way out of the pipe.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Middleware' title='Terminating & response middleware' />
        <Lead>
          Because a middleware wraps <code>next</code>, it owns both sides of the request: before, on
          the way in, and after, on the way out. The way out is where you shape the response, add
          headers, and run work that should happen once the outcome is known.
        </Lead>

        <H2>Acting on the response</H2>
        <p>
          Await <code>next(event)</code> to get the response the handler (and inner middleware)
          produced, then modify or wrap it before returning. This is how envelopes, timing headers and
          response-wide transforms are done, in one place, for many routes.
        </p>
        <Code file='app/middleware/SecurityHeaders.ts'>{`export const securityHeaders = defineMiddleware(async (event, next) => {
  const response = await next(event)              // wait for the outcome
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response                                 // hand the shaped response back out
})`}</Code>
        <Aphorism>The way in guards the request. The way out finishes the response.</Aphorism>

        <H2>Cleanup after the response</H2>
        <p>
          Work that must run whether or not the handler threw belongs in a <code>finally</code> around
          <code> next</code>: close a span, release a lease, record a metric. It runs on success and on
          error alike.
        </p>
        <Code file='app/middleware/Trace.ts'>{`export const trace = defineMiddleware(async (event, next) => {
  const span = startSpan(event.get('path'))
  try {
    return await next(event)
  } finally {
    span.end()                                    // always runs, success or failure
  }
})`}</Code>

        <Callout kind='note' title='Heavy after-work in serverless'>
          On serverless and edge runtimes the response may be sent before the function fully unwinds.
          For genuinely fire-and-forget work (analytics, webhooks), prefer an event and a listener over
          blocking the response path; keep the pipe's way-out fast.
        </Callout>

        <SeeAlso links={[
          { title: 'Registering middleware', path: '/docs/middleware/registering' },
          { title: 'Outgoing response', path: '/docs/essentials/outgoing-response' },
          { title: 'Events & listeners', path: '/docs/essentials/events' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
