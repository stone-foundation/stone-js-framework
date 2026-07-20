import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/primitives/service-container'

/**
 * Primitives: service container.
 */
@Page(PATH, { layout: 'docs' })
export class ServiceContainer implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Service container',
      description: '@stone-js/service-container: the dependency-injection container as a standalone library, bindings, singletons, aliases, resolution.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Primitives' title='Service container' />
        <Lead>
          <code>@stone-js/service-container</code> is dependency injection as a small library. The
          framework creates one per event as the ephemeral context, but the container stands alone:
          register bindings, resolve them, and let it construct dependency graphs for you.
        </Lead>

        <H2>Standalone use</H2>
        <p>
          Create a container, register bindings, and resolve. The same methods documented in the DI
          section are the container's public surface.
        </p>
        <Code file='example.ts'>{`import { Container } from '@stone-js/service-container'

const container = Container.create()

container.instance('config', { pageSize: 20 })
container.singleton('tasks', (c) => new TaskService(c.make('config')))
container.alias('tasks', ['taskService'])

const tasks = container.resolve('tasks')   // built once, cached
const same = container.make('taskService') // resolved via the alias`}</Code>

        <H2>The surface</H2>
        <PropsTable nameHeader='Method' rows={[
          { name: 'Container.create()', type: '() => Container', desc: 'Create a container.' },
          { name: 'singleton(key, resolver)', type: '(key, (c) => V) => this', desc: 'Register a value built once and cached.' },
          { name: 'instance(key, value)', type: '(key, V) => this', desc: 'Register an already-built value.' },
          { name: 'alias(key, aliases)', type: '(key, string | string[]) => this', desc: 'Add alternative names.' },
          { name: 'resolve(key, singleton?)', type: '<V>(key) => V', desc: 'Resolve, constructing if needed.' },
          { name: 'make(key)', type: '<V>(key) => V', desc: 'Resolve, failing fast on an unknown key.' },
          { name: 'factory(key)', type: '<V>(key) => () => V', desc: 'A factory that resolves on each call.' },
          { name: 'bound / has', type: '(key) => boolean', desc: 'Test whether a key is bound / known.' }
        ]} />

        <Callout kind='note' title='In the framework it is per-event'>
          A standalone container lives as long as you keep it. Inside Stone.js the kernel creates one
          per event and discards it, which is what makes a "singleton" a per-request singleton and
          keeps state from leaking. See the ephemeral context.
        </Callout>

        <SeeAlso links={[
          { title: 'The container (in the framework)', path: '/docs/di' },
          { title: 'Services', path: '/docs/di/services' },
          { title: 'The ephemeral context', path: '/docs/foundations/ephemeral-context' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
