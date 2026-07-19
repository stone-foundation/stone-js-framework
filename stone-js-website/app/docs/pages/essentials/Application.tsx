import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/application'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { NodeHttp } from '@stone-js/node-http-adapter'

@NodeHttp()
@Routing()
@StoneApp({
  name: 'tasks',
  logger: { level: 'info' }
})
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks', logger: { level: 'info' } },
  [routerBlueprint, nodeHttpAdapterBlueprint]
)
`

/**
 * Essentials: the application and its bootstrap.
 */
@Page(PATH, { layout: 'docs' })
export class Application implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Application & bootstrap',
      description: 'The manifest class that names your app, its adapters and its app-wide options, and how it boots.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Application & bootstrap' />
        <Lead>
          Every Stone.js app has one manifest: a class marked with <code>@StoneApp</code> (or a
          <code> defineStoneApp</code> value). It names the app, lists the adapters that give it a
          context, and sets app-wide options. It is the only file that knows about platforms.
        </Lead>

        <H2>Declaring the app</H2>
        <p>
          The manifest carries no logic of its own. Adapters and blueprints stack on it as
          decorators (or as an array, imperatively); options go to <code>@StoneApp</code>.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H2>App options</H2>
        <PropsTable rows={[
          { name: 'name', type: 'string', desc: 'The application name, used in logs and tooling.' },
          { name: 'logger', type: '{ level, ... }', default: "{ level: 'info' }", desc: 'Logger configuration (see Logging).' },
          { name: 'debug', type: 'boolean', default: 'false', desc: 'Verbose diagnostics and richer error output.' },
          { name: 'middleware', type: 'MixedPipe[]', desc: 'Global middleware for every event.' },
          { name: 'providers', type: 'MixedServiceProvider[]', desc: 'Service providers to register.' }
        ]} />

        <H2>One handler, or a router</H2>
        <p>
          A minimal app can implement a single handler right on the manifest. The moment you need
          more than one entry point, add <code>@Routing()</code> and delegate to controllers, which is
          what most apps do.
        </p>

        <Callout kind='note' title='The manifest is data'>
          Under the hood, <code>@StoneApp</code> and <code>defineStoneApp</code> both produce the same
          Blueprint. Nothing downstream can tell which you used; pick the paradigm you prefer.
        </Callout>

        <SeeAlso links={[
          { title: 'Blueprint: config as a manifest', path: '/docs/foundations/blueprint' },
          { title: 'Event handlers', path: '/docs/essentials/event-handlers' },
          { title: 'Configuration', path: '/docs/essentials/configuration' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
