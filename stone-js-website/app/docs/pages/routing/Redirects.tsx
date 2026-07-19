import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing/redirects'

/**
 * Routing: redirects & responses.
 */
@Page(PATH, { layout: 'docs' })
export class Redirects implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Redirects & responses',
      description: 'What a handler returns becomes the response. Return plain data, set a status, or declare a redirect right on the route.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Redirects & responses' />
        <Lead>
          A handler returns a value and the framework turns it into a response. Most of the time you
          return plain data and let the context shape it; when you need control, you set a status,
          build a response, or declare a redirect on the route itself.
        </Lead>

        <H2>Returning data</H2>
        <p>
          Return an object or array and it becomes the body, serialised by the active context (JSON on
          an HTTP adapter, a rendered view in the browser). This is the default, and it keeps handlers
          platform-agnostic.
        </p>
        <Code file='app/Tasks.ts'>{`@Get('/:id')
show (event: IncomingHttpEvent) {
  return this.tasks.find(event.get('id'))   // -> serialised by the context
}`}</Code>

        <H2>Controlling the response</H2>
        <p>
          When you need a specific status or headers, build a response with the HTTP layer's helpers.
          Throwing a domain error maps to the right status through the error handler, so the common
          cases stay declarative.
        </p>
        <Code file='app/Tasks.ts'>{`import { jsonHttpResponse } from '@stone-js/http-core'

@Post('/')
create (event: IncomingHttpEvent) {
  const task = this.tasks.add(event.get('title'))
  return jsonHttpResponse(task, 201)         // explicit status
}`}</Code>

        <H2>Redirects</H2>
        <p>
          A route can redirect without a handler at all, using the <code>redirect</code> option, or a
          handler can return a redirect response. Use the route option for static moves (renamed
          paths), the response for conditional ones.
        </p>
        <Code file='app/routes.ts'>{`// Static: declare it on the route, no handler needed.
@Get('/old-tasks', { redirect: '/tasks' })
legacy () {}

// Conditional: return a redirect from the handler.
@Post('/tasks')
create (event) {
  const task = this.tasks.add(event.get('title'))
  return reactRedirectResponse(\`/tasks/\${task.id}\`)
}`}</Code>

        <H2>Redirect options</H2>
        <PropsTable nameHeader='Form' rows={[
          { name: "redirect: '/path'", type: 'string', desc: 'Redirect to a path (default status 302).' },
          { name: 'redirect: { location, status }', type: 'object', desc: 'Redirect with an explicit status (301, 307, ...).' },
          { name: 'a redirect response', type: 'from the handler', desc: 'Build the redirect at runtime, based on the outcome.' }
        ]} />

        <Callout kind='note' title='Prefer returning data'>
          Reach for explicit responses only when you need a specific status, headers, or a redirect.
          The more handlers return plain data, the more of your domain stays portable across contexts.
        </Callout>

        <SeeAlso links={[
          { title: 'Matching & precedence', path: '/docs/routing/matching' },
          { title: 'Misc: current route & useRouter', path: '/docs/routing/misc' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
