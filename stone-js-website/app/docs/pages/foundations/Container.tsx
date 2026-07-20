import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/foundations/container'

const DECL = `
import { Service } from '@stone-js/core'

@Service({ alias: 'tasks', singleton: true })
export class TaskService {
  constructor ({ config }) { this.pageSize = config.get('stone.tasks.pageSize', 20) }
}
`

const IMP = `
import { defineService } from '@stone-js/core'

const TaskService = ({ config }) => ({
  pageSize: config.get('stone.tasks.pageSize', 20)
})

export const services = [
  defineService(TaskService, { alias: 'tasks', singleton: true }, true)
]
`

/**
 * Foundations: the service container and DI.
 */
@Page(PATH, { layout: 'docs' })
export class Container implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Service container & DI',
      description: 'The per-event container resolves and injects your services by alias, so the domain declares what it needs and never fetches it.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='Service container & DI' />
        <Lead>
          The container is where dependency injection happens. It is the ephemeral context in
          practice: for each event it resolves the services your handlers ask for and hands them in.
          The domain declares what it needs; it never goes looking.
        </Lead>

        <H2>Depend on names, not construction</H2>
        <Principle
          principle={
            <p>
              When a class builds its own dependencies, it is welded to their concrete types and
              their wiring. When it declares them and receives them, it depends only on a contract.
              Inversion of control is what lets the same domain run against different implementations
              in different contexts.
            </p>
          }
          incarnation={
            <p>
              Register a service with <code>@Service({'{'} alias {'}'})</code> and it is bound under
              that name. Any handler or service that destructures the alias in its constructor
              receives the resolved instance. No <code>new</code>, no imports of implementations, no
              reflect-metadata.
            </p>
          }
        />
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />
        <Aphorism>Ask for what you need by name. The container decides how to build it, and when.</Aphorism>

        <H2>Singletons are per-event</H2>
        <p>
          A <code>singleton: true</code> service is created once per container, which means once per
          event, not once per process. It is the natural default for services that are stateless
          within a request. Because the container is discarded after the event, singletons cannot
          leak between requests.
        </p>

        <H2>Resolving explicitly</H2>
        <p>
          Destructured injection covers almost everything. When you need the container itself, for
          dynamic or conditional resolution, it is available and typed.
        </p>
        <Code file='app/Tasks.ts'>{`constructor ({ container }) {
  this.tasks = container.resolve('tasks')          // by alias
  this.mailer = container.make(MailerService)      // by class
}`}</Code>

        <Callout kind='note' title='The function form gets no container'>
          Class and factory forms receive bindings; the plain function form never does. If a piece of
          your domain needs the container, it must be a class or a factory. The next pages, providers
          and the three forms, make that rule precise.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
