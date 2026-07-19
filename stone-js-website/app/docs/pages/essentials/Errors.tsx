import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/errors'

const DECL = `
import { ErrorHandler } from '@stone-js/core'

@ErrorHandler({ error: 'TaskNotFoundError' })
export class TaskNotFoundHandler {
  handle (error: TaskNotFoundError, event: IncomingHttpEvent) {
    return jsonHttpResponse({ error: 'not_found', id: error.id }, 404)
  }
}
`

const IMP = `
import { defineErrorHandler } from '@stone-js/core'

const TaskNotFoundHandler = () => (error, event) =>
  jsonHttpResponse({ error: 'not_found', id: error.id }, 404)

export const errorHandlers = [
  defineErrorHandler(TaskNotFoundHandler, { error: 'TaskNotFoundError' }, true)
]
`

/**
 * Essentials: error handling.
 */
@Page(PATH, { layout: 'docs' })
export class Errors implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Error handling',
      description: 'Throw meaningful errors from your domain; map them to responses at the edge. Statuses come from the error, not from scattered try/catch.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Error handling' />
        <Lead>
          A handler should state the happy path and throw when the world disagrees. Turning those
          throws into the right response is the boundary's job, not something you scatter through your
          logic as try/catch. Errors carry their own meaning; the framework maps it.
        </Lead>

        <H2>Throw, do not branch</H2>
        <Principle
          principle={
            <p>
              Error handling tangled into business logic obscures both. Let the domain throw a
              meaningful error and stop; let a single place decide how each kind of error becomes a
              response. The happy path stays legible.
            </p>
          }
          incarnation={
            <p>
              The framework ships error types that carry a status (<code>RuntimeError</code>,
              <code> IntegrationError</code>, and the like). Throw one and the kernel maps it to the
              response. Register an <code>@ErrorHandler</code> to customise how a specific error type
              is rendered.
            </p>
          }
        />
        <Code file='app/Tasks.ts'>{`import { RuntimeError } from '@stone-js/core'

show (event: IncomingHttpEvent) {
  const task = this.tasks.find(event.get('id'))
  if (task === undefined) throw new RuntimeError('Task not found')  // -> mapped to a 4xx
  return task
}`}</Code>

        <H2>Custom error handlers</H2>
        <p>
          Map a specific error type to a specific response by registering a handler. It receives the
          error and the event and returns whatever the response should be.
        </p>
        <CodeTabs file='app/errors.ts' decl={DECL} imp={IMP} />

        <H3>Status from the error</H3>
        <PropsTable nameHeader='Error' rows={[
          { name: 'RuntimeError', type: 'domain', desc: 'A general runtime failure in your logic.' },
          { name: 'IntegrationError', type: 'boundary', desc: 'A failure at the integration edge; carries a statusCode (e.g. 401/403 for auth).' },
          { name: 'SetupError', type: 'build', desc: 'A problem while assembling the Blueprint.' },
          { name: 'InitializationError', type: 'kernel', desc: 'A problem while initialising for an event.' }
        ]} />

        <Callout kind='future' title='Error pages, on the frontend'>
          On a React context, an unhandled error can render a dedicated error page instead of a JSON
          body: mark a component with <code>@ErrorPage</code>. Same mechanism, a view instead of a
          payload. See the Frontend section.
        </Callout>

        <SeeAlso links={[
          { title: 'Outgoing response', path: '/docs/essentials/outgoing-response' },
          { title: 'Logging', path: '/docs/essentials/logging' },
          { title: 'Testing', path: '/docs/build/testing' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
