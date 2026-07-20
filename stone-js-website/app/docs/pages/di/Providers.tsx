import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/di/providers'

const DECL = `
import { Provider } from '@stone-js/core'

@Provider()
export class DataProvider {
  constructor ({ container, blueprint }) {
    this.container = container
    this.blueprint = blueprint
  }

  // Phase 1: declare bindings. Do not resolve here.
  register () {
    this.container.singleton('db', () => new Db(this.blueprint.get('stone.db')))
    this.container.alias('db', ['database'])
  }

  // Phase 2: everything is registered; resolving is now safe.
  async boot () {
    await this.container.make('db').connect()
  }

  // Optional: skip this provider in contexts where it does not apply.
  mustSkip () {
    return this.blueprint.get('stone.db') === undefined
  }
}
`

const IMP = `
import { defineServiceProvider } from '@stone-js/core'

const DataProvider = ({ container, blueprint }) => ({
  register () {
    container.singleton('db', () => new Db(blueprint.get('stone.db')))
    container.alias('db', ['database'])
  },
  async boot () {
    await container.make('db').connect()
  },
  mustSkip () {
    return blueprint.get('stone.db') === undefined
  }
})

export const providers = [defineServiceProvider(DataProvider, {}, true)]
`

/**
 * DI: service providers.
 */
@Page(PATH, { layout: 'docs' })
export class Providers implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Service providers',
      description: 'The unit that registers services into the container and boots them in order: how adapters, extensions and your own modules attach.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Dependency injection' title='Service providers' />
        <Lead>
          A provider is how a capability enters the app. It registers bindings, then boots them once
          everything is registered. Every adapter and extension is, underneath, a provider, and your
          own modules attach through the same seam.
        </Lead>

        <H2>Register, then boot</H2>
        <p>
          The two phases must stay separate. <code>register()</code> only declares bindings and must
          not resolve anything, because other providers may not have registered yet. Once all have,
          the kernel calls each <code>boot()</code>, where resolving is safe.
        </p>
        <CodeTabs file='app/DataProvider.ts' decl={DECL} imp={IMP} />

        <H2>The provider contract</H2>
        <PropsTable nameHeader='Member' rows={[
          { name: 'register()', type: '() => void', desc: 'Declare bindings only. Never resolve here.' },
          { name: 'boot()', type: '() => Promiseable<void>', desc: 'Run once all providers have registered; resolving is safe.' },
          { name: 'mustSkip()', type: '() => Promiseable<boolean>', desc: 'Return true to skip this provider in a context it does not apply to.' }
        ]} />

        <H3>Providers forbid the function form</H3>
        <p>
          A provider always needs the container to register into it, so it must be a class or a
          factory, never a plain function. This is the one place the three forms are restricted, and
          the restriction is just the definition of what a provider is.
        </p>

        <Callout kind='future' title='This is how the ecosystem attaches'>
          When you stack <code>@NodeHttp()</code> or add <code>@stone-js/auth</code>, you are adding
          providers that register their services and boot them, through the same contract your own
          providers use. The core needs no knowledge of any of them; they attach, it does not reach
          out.
        </Callout>

        <SeeAlso links={[
          { title: 'The container', path: '/docs/di' },
          { title: 'Services', path: '/docs/di/services' },
          { title: 'Blueprint middleware', path: '/docs/blueprint/middleware' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
