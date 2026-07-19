import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/logging'

/**
 * Essentials: logging.
 */
@Page(PATH, { layout: 'docs' })
export class Logging implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Logging',
      description: 'A logger injected like any service, with levels and a pluggable backend, so diagnostics stay uniform and platform-agnostic.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Logging' />
        <Lead>
          Logging is a service, injected and used the same way everywhere. You log against a uniform
          interface with levels; where those logs go, the console, a file, a cloud sink, is a
          configuration and a backend, not something your code decides.
        </Lead>

        <H2>Logging from your code</H2>
        <p>
          Take the logger from the container and call it by level. Pass structured context as a second
          argument; a good backend keeps it queryable.
        </p>
        <Code file='app/Tasks.ts'>{`constructor ({ logger }) { this.logger = logger }

create (event: IncomingHttpEvent) {
  const task = this.tasks.add(event.get('title'))
  this.logger.info('task created', { id: task.id })
  return task
}`}</Code>

        <H2>Levels</H2>
        <p>
          Set the minimum level in the app options; anything below it is dropped. Use levels with
          intent: <code>debug</code> for development detail, <code>info</code> for notable events,
          <code> warn</code> and <code>error</code> for trouble.
        </p>
        <PropsTable nameHeader='Level' rows={[
          { name: 'trace', type: 'lowest', desc: 'Very fine-grained tracing.' },
          { name: 'debug', type: '', desc: 'Development detail, off in production by default.' },
          { name: 'info', type: '', desc: 'Notable, expected events.' },
          { name: 'warn', type: '', desc: 'Something unexpected that did not stop the request.' },
          { name: 'error', type: 'highest', desc: 'A failure worth attention.' }
        ]} />
        <Code file='app/Application.ts'>{`@StoneApp({ name: 'tasks', logger: { level: 'info' } })
export class Application {}`}</Code>

        <H2>A custom backend</H2>
        <p>
          The logger is an interface; the default writes to the console. Provide your own with
          <code> defineLogger</code> to route logs to a structured sink, a file, or an
          observability platform, without changing a single call site.
        </p>
        <Code file='app/logger.ts'>{`import { defineLogger } from '@stone-js/core'

export const logger = defineLogger(({ config }) => new JsonLogger({
  level: config.get('stone.logger.level', 'info')
}))`}</Code>

        <Callout kind='note' title='Log facts, not noise'>
          Log domain-meaningful events with structured context, not a running commentary. In
          serverless and edge contexts, where every log line has a cost, this discipline pays off
          directly.
        </Callout>

        <SeeAlso links={[
          { title: 'Error handling', path: '/docs/essentials/errors' },
          { title: 'Configuration', path: '/docs/essentials/configuration' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
