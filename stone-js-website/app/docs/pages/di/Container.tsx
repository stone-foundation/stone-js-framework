import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/di'

/**
 * DI: the container (overview + API).
 */
@Page(PATH, { layout: 'docs' })
export class Container implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'The container',
      description: 'The per-event dependency-injection container: how bindings are registered and resolved, and every method you will use.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Dependency injection' title='The container' />
        <Lead>
          The container is where dependency injection happens: for each event it holds the services
          your code asks for and hands them in. Most of the time you never touch it directly, you
          declare what you need and it arrives, but when you need control, this is the surface.
        </Lead>

        <H2>Bindings and resolution</H2>
        <p>
          A binding maps a key (a class or an alias) to a way of producing a value. Resolution asks
          the container for a key and gets the value back, constructing it and its dependencies as
          needed. The container is created fresh per event, so bindings do not leak between requests.
        </p>
        <Code file='app/providers/AppProvider.ts'>{`register () {
  // A singleton: built once per container (i.e. once per event), then cached.
  this.container.singleton('tasks', (c) => new TaskService(c.make('db')))

  // A fixed value.
  this.container.instance('clock', () => Date.now())

  // An alias: another name for an existing binding.
  this.container.alias('tasks', ['taskService'])
}`}</Code>

        <H2>Container methods</H2>
        <PropsTable nameHeader='Method' rows={[
          { name: 'singleton(key, resolver)', type: '(key, (c) => V) => this', desc: 'Register a value built once per container and cached.' },
          { name: 'instance(key, value)', type: '(key, V) => this', desc: 'Register an already-built value.' },
          { name: 'alias(key, aliases)', type: '(key, string | string[]) => this', desc: 'Add one or more alternative names for a binding.' },
          { name: 'resolve(key, singleton?)', type: '<V>(key) => V', desc: 'Resolve a value by key, constructing it if needed.' },
          { name: 'make(key)', type: '<V>(key) => V', desc: 'Resolve, failing fast on an unknown key.' },
          { name: 'factory(key)', type: '<V>(key) => () => V', desc: 'Get a factory that resolves the key on each call.' },
          { name: 'bound(key)', type: '(key) => boolean', desc: 'Whether a key has a binding.' },
          { name: 'has(key)', type: '(key) => boolean', desc: 'Whether a key is known to the container.' }
        ]} />

        <H3>Prefer declaring over resolving</H3>
        <p>
          Reaching into the container by hand is the exception. The rule is to declare dependencies
          and let them be injected: register services with <code>@Service</code>, and destructure them
          in a constructor. Use the container API for dynamic or conditional wiring only.
        </p>
        <Code file='app/Tasks.ts'>{`// Preferred: declare and receive.
constructor ({ tasks }: { tasks: TaskService }) { this.tasks = tasks }

// Exception: resolve explicitly when the dependency is dynamic.
constructor ({ container }) { this.driver = container.make(pickDriver()) }`}</Code>

        <Callout kind='note' title='The container is ephemeral'>
          A new container is built for every event and discarded after. A "singleton" is a singleton
          for that one event, not for the process, which is exactly why request state cannot leak. See
          the ephemeral context.
        </Callout>

        <SeeAlso links={[
          { title: 'Services', path: '/docs/di/services' },
          { title: 'Service providers', path: '/docs/di/providers' },
          { title: 'The ephemeral context', path: '/docs/foundations/ephemeral-context' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
