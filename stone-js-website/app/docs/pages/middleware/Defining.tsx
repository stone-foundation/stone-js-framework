import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/middleware/defining'

const DECL = `
import { Middleware, NextPipe } from '@stone-js/core'
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

@Middleware()
export class EnsureJson {
  async handle (event: IncomingHttpEvent, next: NextPipe<IncomingHttpEvent, OutgoingHttpResponse>) {
    if (event.get('contentType') !== 'application/json') {
      throw new RuntimeError('JSON required')       // short-circuit: never calls next
    }
    return next(event)
  }
}
`

const IMP = `
import { defineMiddleware } from '@stone-js/core'

// Functional: the simplest form.
export const ensureJson = defineMiddleware((event, next) => {
  if (event.get('contentType') !== 'application/json') throw new RuntimeError('JSON required')
  return next(event)
})
`

/**
 * Middleware: defining.
 */
@Page(PATH, { layout: 'docs' })
export class Defining implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Defining middleware',
      description: 'Write middleware as a class, a factory or a function. Configurable middleware is a factory that returns a pipe.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Middleware' title='Defining middleware' />
        <Lead>
          Middleware follows the three forms like everything else. A class carries its dependencies; a
          factory receives the container; a plain function is the bare pipe. Choose by what the
          middleware needs.
        </Lead>

        <H2>The three forms</H2>
        <p>
          A class implements <code>handle(event, next)</code>. A functional middleware is just that
          signature as a function. A factory receives the container and returns the pipe, which is how
          middleware gets its own dependencies.
        </p>
        <CodeTabs file='app/middleware/EnsureJson.ts' decl={DECL} imp={IMP} />

        <H3>Configurable middleware</H3>
        <p>
          Middleware that takes options is a function returning a pipe. This is exactly how the
          built-in guards work: <code>requireAuth()</code> and <code>validate(schema)</code> are
          factories that return the actual middleware.
        </p>
        <Code file='app/middleware/rateLimit.ts'>{`export const rateLimit = (perMinute: number) =>
  defineMiddleware((event, next) => {
    if (overLimit(event, perMinute)) throw new RuntimeError('Too many requests')
    return next(event)
  })

// used on a route: middleware: [rateLimit(60)]`}</Code>

        <H2>On the way out</H2>
        <p>
          Because a middleware wraps <code>next</code>, it can also transform the response after the
          handler runs: set a header, wrap a body, measure timing. Await <code>next(event)</code>,
          then work with what it returns.
        </p>
        <Code file='app/middleware/wrap.ts'>{`export const envelope = defineMiddleware(async (event, next) => {
  const response = await next(event)
  response.setContent({ data: response.getContent(), meta: { at: Date.now() } })
  return response
})`}</Code>

        <Callout kind='note' title='Keep middleware single-purpose'>
          One middleware, one concern. Compose several small pipes rather than one that does auth,
          validation and logging at once; they are easier to reorder, reuse and reason about.
        </Callout>

        <SeeAlso links={[
          { title: 'Registering middleware', path: '/docs/middleware/registering' },
          { title: 'The three forms', path: '/docs/foundations/forms' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
