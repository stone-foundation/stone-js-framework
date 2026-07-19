import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/blueprint/meta-modules'

/**
 * Blueprint & build: meta-modules and the define* family.
 */
@Page(PATH, { layout: 'docs' })
export class MetaModules implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Meta-modules & define*',
      description: 'The imperative model: define* helpers produce meta-modules, plain descriptors merged into the Blueprint, the exact equivalent of decorators.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Blueprint & build' title='Meta-modules & define*' />
        <Lead>
          The imperative paradigm is not a lesser path; it is the same destination reached with plain
          values. A <code>define*</code> helper wraps your module in a meta-module, a small descriptor
          the build phase merges into the Blueprint. It is exactly what a decorator produces, written
          by hand.
        </Lead>

        <H2>What a meta-module is</H2>
        <p>
          A meta-module is a descriptor: the module itself plus flags telling the builder how to treat
          it. Its shape is deliberately tiny.
        </p>
        <Code file='shape.ts'>{`interface MetaModule {
  module: unknown      // the class, factory or function
  isClass?: boolean    // treat module as a class
  isFactory?: boolean  // treat module as a factory (receives the container)
  // ...plus the options specific to each kind (alias, path, event, ...)
}`}</Code>

        <H2>The define* family</H2>
        <p>
          Each declarative decorator has an imperative twin. The third argument of most helpers is the
          <code> isFactory</code> flag; pass <code>true</code> for a factory, omit it for a class.
        </p>
        <PropsTable nameHeader='Helper' rows={[
          { name: 'defineStoneApp(config, blueprints)', type: 'app', desc: 'The manifest (equivalent of @StoneApp).' },
          { name: 'defineService(mod, opts, isFactory?)', type: 'service', desc: 'A service (equivalent of @Service).' },
          { name: 'defineServiceProvider(mod, opts, isFactory?)', type: 'provider', desc: 'A provider (equivalent of @Provider).' },
          { name: 'defineEventHandler(mod, method?)', type: 'handler', desc: 'A route handler (equivalent of @EventHandler + verbs).' },
          { name: 'defineMiddleware(mod, opts)', type: 'middleware', desc: 'Middleware (equivalent of @Middleware).' },
          { name: 'defineEventListener(mod, opts, isFactory?)', type: 'listener', desc: 'An event listener (equivalent of @Listener).' },
          { name: 'defineErrorHandler(mod, opts, isFactory?)', type: 'error handler', desc: 'An error handler (equivalent of @ErrorHandler).' },
          { name: 'defineLogger / defineBlueprintMiddleware / ...', type: 'various', desc: 'One helper per declarative decorator.' }
        ]} />

        <H3>Assembling an app imperatively</H3>
        <Code file='app/App.ts'>{`import { defineStoneApp, defineService } from '@stone-js/core'
import { defineEventHandler, defineRoutes, routerBlueprint } from '@stone-js/router'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'

const TaskService = () => ({ list: () => [/* ... */] })
const TaskController = ({ tasks }) => ({ list: () => tasks.list() })

export const App = defineStoneApp({ name: 'tasks' }, [
  routerBlueprint,
  nodeHttpAdapterBlueprint,
  { services: [defineService(TaskService, { alias: 'tasks' }, true)] },
  { routes: defineRoutes([[defineEventHandler(TaskController, 'list'), { path: '/tasks', method: 'GET' }]]) }
])`}</Code>

        <Callout kind='note' title='Same Blueprint, either way'>
          A decorator writes <code>stone.*</code> keys by introspection; a <code>define*</code> module
          writes the same keys explicitly. Once built, the Blueprint is identical and nothing
          downstream can tell which paradigm you used.
        </Callout>

        <SeeAlso links={[
          { title: 'The two paradigms', path: '/docs/foundations/paradigms' },
          { title: 'The Blueprint', path: '/docs/blueprint' },
          { title: 'The three forms', path: '/docs/foundations/forms' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
