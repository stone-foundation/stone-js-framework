import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/di/services'

const DECL = `
import { Service } from '@stone-js/core'

@Service({ alias: 'tasks', singleton: true })
export class TaskService {
  // Other services arrive by their alias, destructured.
  constructor ({ db, logger }: { db: Db, logger: ILogger }) {
    this.db = db
    this.logger = logger
  }

  list () { return this.db.query('tasks') }
}
`

const IMP = `
import { defineService } from '@stone-js/core'

const TaskService = ({ db, logger }) => ({
  list: () => db.query('tasks')
})

export const services = [
  defineService(TaskService, { alias: 'tasks', singleton: true }, true)
]
`

/**
 * DI: services.
 */
@Page(PATH, { layout: 'docs' })
export class Services implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Services',
      description: 'Register a class or factory as an injectable service with @Service or defineService: aliases, singletons, and how injection resolves.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Dependency injection' title='Services' />
        <Lead>
          A service is a unit of logic the container can build and inject. Register it once, give it a
          name, and any handler or other service can ask for it by that name. This is how the domain
          declares what it needs without ever constructing it.
        </Lead>

        <H2>Registering a service</H2>
        <p>
          Mark a class with <code>@Service</code> (or register a <code>defineService</code>). The
          <code> alias</code> is the name it is bound under and the name others destructure to receive
          it. Injection is by alias, not by type, because Stone.js uses no reflect-metadata.
        </p>
        <CodeTabs file='app/TaskService.ts' decl={DECL} imp={IMP} />

        <H2>Service options</H2>
        <PropsTable rows={[
          { name: 'alias', type: 'string | string[]', required: true, desc: 'The name(s) the service is bound under and injected by.' },
          { name: 'singleton', type: 'boolean', default: 'false', desc: 'Build once per container (per event) and cache; otherwise built on each resolution.' }
        ]} />

        <H3>Injection resolves by alias</H3>
        <p>
          Because there is no type reflection, a constructor receives a single object of resolved
          bindings, and you destructure the aliases you want. The names must match the aliases you
          registered.
        </p>
        <CodeTabs
          file='app/Tasks.ts'
          decl={`@EventHandler('/tasks')
export class TaskController {
  constructor ({ tasks }: { tasks: TaskService }) { this.tasks = tasks }
}`}
          imp={`const TaskController = ({ tasks }) => ({
  list: () => tasks.list()
})`}
        />

        <Callout kind='note' title='Singletons are per event'>
          A <code>singleton</code> service lives for one container, which means one event. It is the
          right default for services that are stateless within a request; the ephemeral container
          guarantees nothing leaks to the next one.
        </Callout>

        <SeeAlso links={[
          { title: 'The container', path: '/docs/di' },
          { title: 'Service providers', path: '/docs/di/providers' },
          { title: 'The three forms', path: '/docs/foundations/forms' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
