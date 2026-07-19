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
          { name: 'redirectHttpResponse(url, status?)', type: '(url, status) => Response', desc: 'A redirect (default 302).' },
          { name: 'fileHttpResponse(file)', type: '(file) => Response', desc: 'Stream a file back.' },
          { name: 'response.setHeader / setCookie', type: 'methods', desc: 'Set headers and cookies on any response.' }
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
