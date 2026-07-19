import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/incoming-event'

/**
 * Essentials: the incoming event.
 */
@Page(PATH, { layout: 'docs' })
export class IncomingEvent implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Incoming event',
      description: 'The normalised intention your handler reads. One accessor for every input, plus typed getters for the details of an HTTP request.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Incoming event' />
        <Lead>
          The <code>IncomingEvent</code> is the intention, the clean, normalised form of whatever
          cause arrived. Your handler reads everything it needs from it, and never touches a raw
          platform request. That is what keeps a handler portable across every context.
        </Lead>

        <H2>One accessor for input</H2>
        <Principle
          principle={
            <p>
              A handler that reaches into a platform request object is welded to that platform. A
              handler that reads named values from an intention is not. The event is that intention:
              a uniform surface over params, query and body.
            </p>
          }
          incarnation={
            <p>
              <code>event.get(key, default?)</code> reads a value from any source. The typed overload
              <code> event.get&lt;T&gt;(key, default)</code> states the shape you expect.
              <code> event.has(key)</code> tests presence.
            </p>
          }
        />
        <Code file='app/Tasks.ts'>{`create (event: IncomingHttpEvent) {
  const title = event.get<string>('title')          // body or query or param
  const notify = event.get<boolean>('notify', false)
  if (!event.has('title')) throw new RuntimeError('title is required')
  return this.tasks.add(title, { notify })
}`}</Code>

        <H2>HTTP details</H2>
        <p>
          When you are on an HTTP context, the event exposes typed getters for the request's details.
          Reach for these when you genuinely need transport specifics; prefer <code>get()</code> for
          domain values.
        </p>
        <PropsTable nameHeader='Member' rows={[
          { name: 'event.body', type: 'unknown', desc: 'The parsed request body.' },
          { name: 'event.params', type: 'Record<string, string>', desc: 'Captured path parameters.' },
          { name: 'event.query', type: 'query params', desc: 'The parsed query string.' },
          { name: 'event.headers', type: 'headers', desc: 'Request headers.' },
          { name: 'event.cookies', type: 'cookies', desc: 'Parsed cookies (see Cookies).' },
          { name: 'event.uri / path / pathname', type: 'string', desc: 'The request URL and its parts.' },
          { name: 'event.method', type: 'HttpMethod', desc: 'The HTTP verb.' },
          { name: 'event.isSecure / isXhr / isAjax', type: 'boolean', desc: 'Common request predicates.' },
          { name: 'event.getFile(name)', type: '(name) => File', desc: 'An uploaded file, when the body is multipart.' }
        ]} />

        <H3>Files and uploads</H3>
        <Code file='app/Uploads.ts'>{`@Post('/import')
import (event: IncomingHttpEvent) {
  const file = event.getFile('csv')     // a multipart upload
  return this.importer.run(file)
}`}</Code>

        <Callout kind='important' title='Never trust raw input'>
          Values on the event are user input until proven otherwise. Put a <code>validate(...)</code>
          middleware on the route so the handler only runs on well-formed data, and let model binding
          turn ids into entities.
        </Callout>

        <SeeAlso links={[
          { title: 'Outgoing response', path: '/docs/essentials/outgoing-response' },
          { title: 'Query & body', path: '/docs/routing/query-body' },
          { title: 'Validation', path: '/docs/build/validation' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
