import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/outgoing-response'

/**
 * Essentials: the outgoing response.
 */
@Page(PATH, { layout: 'docs' })
export class OutgoingResponse implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Outgoing response',
      description: 'What a handler returns becomes the response. Return plain data by default; build an explicit response when you need status, headers or cookies.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Outgoing response' />
        <Lead>
          The mirror of the incoming event: what your handler returns is turned into a response by
          the active context. Return plain data and let the context shape it, or take control with an
          explicit response when the situation calls for it.
        </Lead>

        <H2>Return data, stay portable</H2>
        <Principle
          principle={
            <p>
              A handler that builds a platform response is tied to that platform. A handler that
              returns a value leaves the shaping to the boundary, so the same handler yields JSON on
              an API and a rendered view in the browser.
            </p>
          }
          incarnation={
            <p>
              Return an object or array and it becomes the body, serialised by the context. Throw a
              domain error and the error handler maps it to the right status. Most handlers never
              build a response at all.
            </p>
          }
        />
        <Code file='app/Tasks.ts'>{`@Get('/:id')
show (event: IncomingHttpEvent) {
  return this.tasks.find(event.get('id'))   // -> 200 + JSON, on an HTTP context
}`}</Code>

        <H2>Taking control</H2>
        <p>
          When you need a specific status, headers, or cookies, build a response with the HTTP layer's
          helpers and set what you need.
        </p>
        <Code file='app/Tasks.ts'>{`import { jsonHttpResponse } from '@stone-js/http-core'

@Post('/')
create (event: IncomingHttpEvent) {
  const task = this.tasks.add(event.get('title'))
  const response = jsonHttpResponse(task, 201)   // explicit status
  response.setHeader('Location', \`/tasks/\${task.id}\`)
  return response
}`}</Code>

        <H2>Response helpers</H2>
        <PropsTable nameHeader='Helper' rows={[
          { name: 'jsonHttpResponse(data, status?)', type: '(data, status) => Response', desc: 'A JSON body with an optional status.' },
          { name: 'htmlHttpResponse(html, status?)', type: '(html, status) => Response', desc: 'An HTML body.' },
          { name: 'noContentHttpResponse()', type: '() => Response', desc: 'A 204 with no body.' },
          { name: 'jsonpHttpResponse(data, cb)', type: '(data, callback) => Response', desc: 'A JSONP body for a named callback.' },
          { name: 'redirectHttpResponse(url, status?)', type: '(url, status) => Response', desc: 'A redirect (default 302).' },
          { name: 'fileHttpResponse(file)', type: '(file) => Response', desc: 'Stream or download a file.' },
          { name: 'emptyHttpResponse()', type: '() => Response', desc: 'An empty body (defaults to 200).' }
        ]} />
        <p>
          For the common failures there are status shortcuts, so you can be explicit when throwing a
          domain error is not the right fit: <code>badRequestHttpResponse</code>,
          <code> unauthorizedHttpResponse</code>, <code>forbiddenHttpResponse</code>,
          <code> notFoundHttpResponse</code>, <code>serverErrorHttpResponse</code>.
        </p>

        <H2>Shaping a response</H2>
        <p>
          Any response is fluent: set the status, headers, cookies and caching hints before returning
          it. The caching setters (<code>setEtag</code>, <code>setLastModified</code>) let a handler
          participate in conditional requests without touching the platform.
        </p>
        <Code file='app/Reports.ts'>{`return jsonHttpResponse(report)
  .setStatus(200)
  .setHeader('Cache-Control', 'public, max-age=60')
  .setEtag(report.hash)            // enables 304 on re-request
  .setLastModified(report.updatedAt)`}</Code>
        <PropsTable nameHeader='Setter' rows={[
          { name: 'setStatus(code)', type: '(number) => this', desc: 'The HTTP status.' },
          { name: 'setHeader(name, value)', type: '(name, value) => this', desc: 'A response header.' },
          { name: 'setCookie(name, value, opts?)', type: '(name, value, opts) => this', desc: 'A cookie (see Cookies).' },
          { name: 'setContent(data)', type: '(data) => this', desc: 'Replace the body.' },
          { name: 'setEtag(tag) / setLastModified(date)', type: 'caching', desc: 'Conditional-request hints for 304 handling.' }
        ]} />

        <Callout kind='note' title='Errors are responses too'>
          You rarely return error responses by hand. Throw a domain error and the error handler maps
          it to a status (a not-found to 404, a validation failure to 422). See Error handling.
        </Callout>

        <SeeAlso links={[
          { title: 'Incoming event', path: '/docs/essentials/incoming-event' },
          { title: 'Cookies', path: '/docs/essentials/cookies' },
          { title: 'Error handling', path: '/docs/essentials/errors' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
