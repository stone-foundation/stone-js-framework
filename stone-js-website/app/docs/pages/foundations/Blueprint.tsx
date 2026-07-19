import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/foundations/blueprint'

const DECL = `
import { StoneApp } from '@stone-js/core'

@StoneApp({
  name: 'tasks',
  logger: { level: 'info' }
})
export class Application {}
// The decorator's options are read into the Blueprint under the stone.* namespace.
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'

// A meta-module: an imperative description merged into the Blueprint.
export const appConfig = {
  stone: { name: 'tasks', logger: { level: 'info' } }
}

export const App = defineStoneApp(appConfig, [/* blueprints */])
`

/**
 * Foundations: the Blueprint.
 */
@Page(PATH, { layout: 'docs' })
export class Blueprint implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Blueprint: config as a manifest',
      description: 'The single, immutable manifest of the whole application, built once before any event from your decorators or define* modules.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='Blueprint: config as a manifest' />
        <Lead>
          The Blueprint is how Stone.js incarnates the setup dimension: one manifest that describes
          the entire application, assembled once before the first event and then frozen. Everything
          the framework does at runtime, it reads from here.
        </Lead>

        <H2>Configuration as a single source</H2>
        <Principle
          principle={
            <p>
              When configuration is scattered and mutable, behaviour depends on the order things
              happened to be set. Collapse it into one manifest, computed once before anything runs,
              and behaviour depends only on what the manifest declares. Setup stops being a runtime
              concern.
            </p>
          }
          incarnation={
            <p>
              The Blueprint is a config store addressed by dotted <code>stone.*</code> keys. It is
              built by introspecting your decorators or by merging imperative meta-modules, then made
              immutable. Adapters, providers, middleware and routes all live here as data.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H2>Two ways to fill it, one result</H2>
        <p>
          Declarative and imperative are just two syntaxes that produce the same Blueprint. A
          decorator writes keys by introspection; a <code>define*</code> meta-module writes the same
          keys explicitly. Downstream, nothing can tell which was used, because the manifest is
          identical.
        </p>
        <Aphorism>Decorators and define* are two pens. The Blueprint is the one page they both write.</Aphorism>

        <H2>Reading it at runtime</H2>
        <p>
          Inside the app, the config store is injected like any service and read by the same dotted
          keys. It is read-only; the manifest never changes mid-flight.
        </p>
        <Code file='app/Tasks.ts'>{`constructor ({ config }) {
  this.pageSize = config.get('stone.tasks.pageSize', 20)  // key, default
}`}</Code>

        <Callout kind='future' title='The manifest is a value, so it travels'>
          Because the Blueprint is plain data resolved at startup, the same domain can be handed a
          different manifest per deployment, dev on Node, prod on the edge, agents in staging,
          without touching a line of domain code. The next page shows how that manifest is actually
          built: as a pipeline.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
