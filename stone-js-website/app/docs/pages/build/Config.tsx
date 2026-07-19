import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Pager } from '../../components/content'

const PATH = '/docs/build/config'

const DECL = `
import { StoneApp } from '@stone-js/core'

@StoneApp({
  name: 'tasks',
  logger: { level: 'info' }
})
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'

export const App = defineStoneApp(
  { name: 'tasks', logger: { level: 'info' } },
  [/* blueprints */]
)
`

/**
 * Build: configuration and environment.
 */
@Page(PATH, { layout: 'docs' })
export class Config implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Config & environment',
      description: 'Configuration is a single manifest, resolved once before any event. Read the environment through typed, validated getters.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Build' title='Config & environment' />
        <Lead>
          Configuration in Stone.js is not a bag of options read at random moments. It is one
          manifest, the Blueprint, assembled once before the first event and then immutable. That
          single fact removes a whole class of order-of-initialisation bugs.
        </Lead>

        <H2>Configuration is a manifest</H2>
        <Principle
          principle={
            <p>
              When configuration is mutable and read lazily, behaviour depends on <em>when</em> each
              value happened to be set. Freeze it into one manifest built before anything runs, and
              behaviour depends only on <em>what</em> the manifest says.
            </p>
          }
          incarnation={
            <p>
              The Blueprint is that manifest, addressed by dotted <code>stone.*</code> keys. It is
              built by introspecting your decorators or by imperative meta-modules, once, in the
              setup dimension. Handlers read it; nothing rewrites it mid-flight.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Reading config at runtime</H3>
        <p>
          Inside the app, the config store is injected like any service. Values are addressed by
          the same dotted keys.
        </p>
        <Code file='app/Tasks.ts'>{`constructor ({ config }) {
  this.pageSize = config.get('stone.tasks.pageSize', 20)  // key, default
}`}</Code>

        <H2>Environment, typed and validated</H2>
        <p>
          The environment is the least trustworthy input an app has: strings, possibly missing,
          possibly malformed. <code>@stone-js/env</code> reads it through typed getters that parse
          and validate, so a bad value fails loudly at the edge instead of surfacing as a mystery
          later.
        </p>
        <Code file='app/config.ts'>{`import { getString, getNumber, getBoolean, getUrl } from '@stone-js/env'

const dbUrl = getUrl('DATABASE_URL')            // throws if absent or not a URL
const pageSize = getNumber('PAGE_SIZE', 20)     // parsed, with a default
const debug = getBoolean('DEBUG', false)
const region = getString('REGION', 'eu-west-3')`}</Code>

        <Callout kind='note' title='Secrets belong to the context'>
          Environment values are part of the context, not the domain. Read them at the edge (in
          config or a provider) and inject the results inward, so handlers stay ignorant of where a
          value came from and remain portable across platforms.
        </Callout>

        <Callout kind='future' title='Same manifest, different platform'>
          Because the Blueprint is resolved once at startup, the very same domain can be handed a
          different manifest per deployment, dev on Node, prod on the edge, without a line of
          domain code changing. Configuration is where the context is tuned, not where it leaks in.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
