import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing/query-body'

/**
 * Routing: query & body.
 */
@Page(PATH, { layout: 'docs' })
export class QueryBody implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Query & body',
      description: 'Read query strings and request bodies the same way you read path parameters: one accessor, transport-agnostic.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Query & body' />
        <Lead>
          Path parameters, query strings and request bodies all arrive as one thing: values on the
          event. A single accessor reads them, so your handler never branches on where a value came
          from, only on what it means.
        </Lead>

        <H2>One accessor for everything</H2>
        <p>
          <code>event.get(key, default?)</code> reads a value whatever its source. The typed overload
          <code> event.get&lt;T&gt;(key, default)</code> documents the shape you expect. Precedence
          and the raw containers are available when you need to be explicit.
        </p>
        <Code file='app/Tasks.ts'>{`@Get('/')
list (event: IncomingHttpEvent) {
  const status = event.get<string>('status', 'all')   // ?status=done
  const limit  = Number(event.get<string>('limit', '20'))
  return this.tasks.list({ status, limit })
}

@Post('/')
create (event: IncomingHttpEvent) {
  const title = event.get<string>('title')            // from the body
  return this.tasks.add(title)
}`}</Code>

        <H2>Reading specific sources</H2>
        <PropsTable nameHeader='Accessor' rows={[
          { name: "event.get(k, d?)", type: '(key, default?)', desc: 'Read a value from any source (params, query, body), with an optional default.' },
          { name: 'event.has(k)', type: '(key)', desc: 'Whether a key is present.' },
          { name: 'event.query', type: 'URLSearchParams-like', desc: 'The parsed query string.' },
          { name: 'event.body', type: 'unknown', desc: 'The parsed request body (JSON, form, ...).' },
          { name: 'event.params', type: 'Record<string, string>', desc: 'The captured path parameters.' }
        ]} />

        <Callout kind='important' title='Validate before you trust'>
          Query and body values are user input. Do not trust their shape: put a
          <code> validate(...)</code> middleware on the route, so the handler only runs on well-formed
          data. See the Validation extension.
        </Callout>

        <Callout kind='future' title='Uploads and files'>
          File uploads arrive on the event too, exposed by the HTTP layer. The dedicated Essentials
          page on the incoming event covers bodies, files and headers in full; routing just hands you
          the event.
        </Callout>

        <SeeAlso links={[
          { title: 'Parameters & constraints', path: '/docs/routing/parameters' },
          { title: 'Validation', path: '/docs/build/validation' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
