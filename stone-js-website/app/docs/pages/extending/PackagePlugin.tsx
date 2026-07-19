import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extending/package'

/**
 * Extending: create a package or plugin.
 */
@Page(PATH, { layout: 'docs' })
export class PackagePlugin implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Create a package or plugin',
      description: 'Package a capability as a reusable Stone.js extension: a blueprint, providers, and the decorators or define* helpers consumers add.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extending' title='Create a package or plugin' />
        <Lead>
          A Stone.js package bundles a capability so others can add it in one line. It is not a special
          artifact: it is a normal npm package that exports a blueprint (and usually some providers,
          decorators or services), plus the seams that let consumers wire it declaratively or
          imperatively.
        </Lead>

        <H2>The anatomy</H2>
        <p>
          A well-formed extension exports, at minimum, a blueprint that registers everything it needs.
          Optionally it ships decorators and <code>define*</code> helpers so consumers get both
          paradigms, and a service provider that does the actual wiring.
        </p>
        <PropsTable nameHeader='Export' rows={[
          { name: 'xxxBlueprint', type: 'blueprint', desc: 'The single entry point: registers providers, middleware, config defaults.' },
          { name: '@Xxx() decorator', type: 'declarative', desc: 'Optional: lets consumers enable the package with an annotation.' },
          { name: 'defineXxx(...)', type: 'imperative', desc: 'Optional: the define* twin, for the imperative paradigm.' },
          { name: 'XxxServiceProvider', type: 'provider', desc: 'Registers and boots the package’s services.' }
        ]} />

        <H3>A minimal blueprint</H3>
        <Code file='src/blueprint.ts'>{`import { CacheServiceProvider } from './CacheServiceProvider'

export const cacheBlueprint = {
  stone: {
    providers: [CacheServiceProvider],
    cache: { driver: 'memory' }          // config defaults consumers can override
  }
}`}</Code>

        <H3>The provider that wires it</H3>
        <Code file='src/CacheServiceProvider.ts'>{`import { Provider } from '@stone-js/core'

@Provider()
export class CacheServiceProvider {
  constructor ({ container, blueprint }) { this.container = container; this.blueprint = blueprint }

  register () {
    const driver = this.blueprint.get('stone.cache.driver', 'memory')
    this.container.singleton('cache', () => createCache(driver))
  }
}`}</Code>

        <H2>How consumers add it</H2>
        <Code file='app/Application.ts'>{`import { cacheBlueprint } from '@acme/stone-cache'

// imperative:
export const App = defineStoneApp({ name: 'app' }, [routerBlueprint, cacheBlueprint])

// or declarative, if you ship a decorator:
@Cache({ driver: 'redis' })
@StoneApp({ name: 'app' })
export class Application {}`}</Code>

        <H2>Publishing</H2>
        <ul>
          <li>ESM only (<code>"type": "module"</code>), TypeScript, ship types.</li>
          <li>Declare <code>@stone-js/*</code> peers you build on; inside a workspace, use <code>workspace:*</code>.</li>
          <li>Own a config namespace under <code>stone.*</code> and document your keys.</li>
          <li>Publish under your scope (or propose it for <code>@stone-js/*</code>); it appears in the marketplace beside first-party packages, with no privileged access.</li>
        </ul>

        <Callout kind='future' title='First-party has no special powers'>
          Every first-party extension is built exactly this way. A community package that exports a
          blueprint and a provider sits beside <code>@stone-js/auth</code> as an equal. That is the
          point of a core that never reaches out.
        </Callout>

        <SeeAlso links={[
          { title: 'Service providers', path: '/docs/di/providers' },
          { title: 'The Blueprint', path: '/docs/blueprint' },
          { title: 'Create a decorator', path: '/docs/extending/decorator' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
