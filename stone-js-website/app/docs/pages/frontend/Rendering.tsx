import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend/rendering'

const SSR_DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'

@Browser()     // resolves the interactive app in the browser
@NodeHttp()    // ...and the first paint on the server
@UseReact()
@Routing()
@StoneApp({ name: 'tasks-ui' })
export class Application {}
`

const SSR_IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { useReactBlueprint } from '@stone-js/use-react'
import { browserAdapterBlueprint } from '@stone-js/browser-adapter'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'

export const App = defineStoneApp(
  { name: 'tasks-ui' },
  [routerBlueprint, useReactBlueprint, browserAdapterBlueprint, nodeHttpAdapterBlueprint]
)
`

/**
 * Frontend: rendering strategies.
 */
@Page(PATH, { layout: 'docs' })
export class Rendering implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Rendering: CSR, SSR, SSG',
      description: 'Three ways to resolve the same pages: in the browser, on the server per request, or pre-rendered at build. You choose in config; pages do not change.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='Rendering: CSR, SSR, SSG' />
        <Lead>
          CSR, SSR and SSG are not three ways to write your app. They are three ways to
          <em> resolve</em> the same pages. You pick one in configuration (and, for SSR, by which
          adapters you stack); the pages you wrote stay identical.
        </Lead>

        <H2>Choosing a strategy</H2>
        <Code file='stone.config.mjs' lang='js'>{`export default defineConfig({
  rendering: 'ssg'   // 'csr' | 'ssr' | 'ssg'
})`}</Code>
        <PropsTable nameHeader='Strategy' rows={[
          { name: 'csr', type: 'client', desc: 'A pure SPA, rendered in the browser. Ship the Browser adapter.' },
          { name: 'ssr', type: 'server + client', desc: 'Rendered per request on a server/edge adapter, then hydrated in the browser.' },
          { name: 'ssg', type: 'build + client', desc: 'Pre-rendered to static HTML at build (list the routes), then hydrated on load.' }
        ]} />

        <H2>SSR is a superposition</H2>
        <p>
          There is no "SSR mode" to write for. Stack a server (or edge) adapter with the Browser
          adapter: the server context resolves the first paint, the browser context resolves
          everything after. The pages never know which one ran them.
        </p>
        <CodeTabs file='app/Application.ts' decl={SSR_DECL} imp={SSR_IMP} />

        <H3>SSG routes</H3>
        <p>
          Static generation pre-renders the routes you list. Parameterised routes are listed
          explicitly. Everything hydrates on load, so the page is interactive after the first paint.
        </p>
        <Code file='stone.config.mjs' lang='js'>{`export default defineConfig({
  rendering: 'ssg',
  ssg: { routes: ['/', '/tasks', '/tasks/1', '/about'] }
})`}</Code>

        <H2>Hydration and the snapshot</H2>
        <p>
          On SSR and SSG, the server render serialises the page's data into the HTML as a snapshot; the
          browser hydrates from it instead of re-fetching, so the first interaction is instant and the
          loader does not run twice. This is automatic; you write pages, not hydration code.
        </p>

        <Callout kind='future' title='Move the first paint to the edge'>
          Swap the server adapter for the fetch adapter and SSR's first paint now happens on a Worker,
          milliseconds from the user, while the browser still owns the rest. Same pages, same domain:
          you moved a context, not a codebase.
        </Callout>

        <SeeAlso links={[
          { title: 'Data fetching', path: '/docs/frontend/data' },
          { title: 'Universal apps', path: '/docs/frontier/universal' },
          { title: 'Edge & Serverless', path: '/docs/contexts/edge' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
