import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/configuration'

const DECL = `
import { StoneApp } from '@stone-js/core'

@StoneApp({
  name: 'tasks',
  // Your own namespace under stone.* is yours to use.
  tasks: { pageSize: 20, allowGuests: false }
})
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'

export const appConfig = {
  stone: { name: 'tasks', tasks: { pageSize: 20, allowGuests: false } }
}

export const App = defineStoneApp(appConfig, [/* blueprints */])
`

const CLASS_DECL = `
import { Configuration, IBlueprint } from '@stone-js/core'

@Configuration()
export class AppConfiguration {
  configure (blueprint: IBlueprint): void {
    blueprint.set('stone.tasks.pageSize', 20)
    // Anything you can compute, you can configure: read the environment, merge a remote
    // overlay, register blueprint middleware, await a source.
  }
}
`

const CLASS_IMP = `
import { defineConfig, IBlueprint } from '@stone-js/core'

export const AppConfiguration = defineConfig((blueprint: IBlueprint) => {
  blueprint.set('stone.tasks.pageSize', 20)
})
`

const PRIORITY_DECL = `
import { Configuration, ConfigurationPriority } from '@stone-js/core'

@Configuration({ priority: ConfigurationPriority.Sources })   // 0: everything may depend on these
export class RemoteConfiguration {
  async configure (blueprint) {
    await loadConfigSources(blueprint, [ssmSource({ path: '/my-app/' })])
  }
}

@Configuration({ priority: ConfigurationPriority.App })       // 10: the default
export class AppConfiguration {
  configure (blueprint) {
    blueprint.set('stone.tasks.pageSize', blueprint.get('remote.pageSize', 20))
  }
}
`

const PRIORITY_IMP = `
import { defineConfig, ConfigurationPriority } from '@stone-js/core'

export const RemoteConfiguration = defineConfig(
  async (blueprint) => await loadConfigSources(blueprint, [ssmSource({ path: '/my-app/' })]),
  { priority: ConfigurationPriority.Sources }   // 0: everything may depend on these
)

export const AppConfiguration = defineConfig(
  (blueprint) => blueprint.set('stone.tasks.pageSize', blueprint.get('remote.pageSize', 20)),
  { priority: ConfigurationPriority.App }       // 10: the default
)
`

/**
 * Essentials: configuration.
 */
@Page(PATH, { layout: 'docs' })
export class Configuration implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Configuration',
      description: 'Set and read application configuration on the Blueprint: dotted stone.* keys, configuration classes in both paradigms, ordering, and reading values at runtime.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Configuration' />
        <Lead>
          Configuration lives on one manifest, the Blueprint, addressed by dotted <code>stone.*</code>
          keys. It is assembled once before the first event, so behaviour depends on what the manifest
          says, never on when a value happened to be set.
        </Lead>

        <H2>Setting configuration</H2>
        <p>
          Pass options to <code>@StoneApp</code> (or into <code>defineStoneApp</code>). Keep your own
          settings under an app namespace so they never collide with framework or module keys.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H2>Configuration classes</H2>
        <p>
          Options on <code>@StoneApp</code> are literals: they say what a value is, not how to work it
          out. Reach for a configuration class as soon as a setting has to be computed, read from the
          environment, merged from a remote overlay, or as soon as you need to register blueprint
          middleware. It receives the Blueprint and writes onto it, before any event exists.
        </p>
        <CodeTabs file='app/configurations/AppConfiguration.ts' decl={CLASS_DECL} imp={CLASS_IMP} />
        <p>
          Both forms are the same thing: a module carrying a <code>configure</code> function, found by
          the same scan. Export it from your app directory and it runs; nothing registers it by hand.
        </p>

        <Callout kind='important' title='Two different defineConfig'>
          <code>defineConfig</code> from <code>@stone-js/core</code> configures your
          {' '}<strong>application</strong>, as above. <code>defineConfig</code> from
          {' '}<code>@stone-js/cli</code> configures the <strong>build</strong>, in
          {' '}<code>stone.config.mjs</code>. Same name, unrelated jobs: check which package an example
          imports from.
        </Callout>

        <H3>Ordering several configurations</H3>
        <p>
          A real application has more than one: static settings, a remote overlay (SSM, Secrets
          Manager), one per vendable module. Give them a <code>priority</code> when one depends on
          what another loads. It is ascending, the lowest runs first, and equal priorities keep their
          declaration order, so configurations that declare nothing behave exactly as before.
        </p>
        <CodeTabs file='app/configurations/RemoteConfiguration.ts' decl={PRIORITY_DECL} imp={PRIORITY_IMP} />
        <p>
          The named steps are <code>Sources</code> (0), <code>App</code> (10) and <code>Module</code>
          {' '}(20), with gaps left so you can slot something between two of them without renumbering.
        </p>

        <H3>Adjusting once everything is in place</H3>
        <p>
          An <code>afterConfigure</code> method runs after <em>every</em> configuration has been
          applied, not just yours. Use it to settle a value that depends on what modules ended up
          declaring, instead of guessing a priority high enough to come last.
        </p>
        <Code file='app/configurations/AppConfiguration.ts'>{`configure (blueprint) {
  blueprint.set('stone.tasks.pageSize', 20)
}

afterConfigure (blueprint) {
  // Every module has declared its middleware by now, so this can react to the final list.
  blueprint.set('stone.tasks.strict', blueprint.get('stone.kernel.middleware', []).length > 0)
}`}</Code>

        <H3>Configuration that changes per event</H3>
        <p>
          A configuration marked <code>live</code> is not applied once at startup: the kernel runs it
          again for each incoming event. That is the deliberate exception to a resolved-once manifest,
          and it costs work on every request, so keep it for values that genuinely move (a
          feature-flag service, a per-tenant overlay) rather than for convenience.
        </p>
        <Code file='app/configurations/FlagsConfiguration.ts'>{`@Configuration({ live: true })
export class FlagsConfiguration {
  async configure (blueprint) {
    blueprint.set('stone.tasks.flags', await fetchFlags())
  }
}`}</Code>

        <H2>Reading configuration</H2>
        <p>
          The config store is injected like any service and read by the same dotted keys, always with
          a default so a missing key never surprises you.
        </p>
        <Code file='app/Tasks.ts'>{`constructor ({ config }) {
  this.pageSize = config.get('stone.tasks.pageSize', 20)
  this.allowGuests = config.get<boolean>('stone.tasks.allowGuests', false)
}`}</Code>

        <H3>Environment-driven config</H3>
        <p>
          Values that differ per deployment come from the environment, read through typed getters and
          folded into the manifest, so the domain never reads <code>process.env</code> directly.
        </p>
        <Code file='app/config.ts'>{`import { getNumber } from '@stone-js/env'

export const appConfig = {
  stone: { tasks: { pageSize: getNumber('PAGE_SIZE', 20) } }
}`}</Code>

        <Callout kind='note' title='Config is resolved once'>
          The manifest is assembled before the first event and then read. Nothing rewrites it
          mid-flight, which is what makes configuration a fact rather than a moving target: to change
          behaviour per deployment, hand the app a different manifest, not mutable state. A
          {' '}<code>live</code> configuration is the one explicit exception, and it announces itself.
        </Callout>

        <SeeAlso links={[
          { title: 'Environment', path: '/docs/essentials/environment' },
          { title: 'Blueprint: config as a manifest', path: '/docs/foundations/blueprint' },
          { title: 'Configuration reference', path: '/docs/reference/config' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
