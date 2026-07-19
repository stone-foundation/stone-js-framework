import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/browser'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'

@Browser()   // run in the browser
@UseReact()
@Routing()
@StoneApp({ name: 'tasks-ui' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { useReactBlueprint } from '@stone-js/use-react'
import { browserAdapterBlueprint } from '@stone-js/browser-adapter'

export const App = defineStoneApp(
  { name: 'tasks-ui' },
  [routerBlueprint, useReactBlueprint, browserAdapterBlueprint]
)
`

/**
 * Adapters: Browser.
 */
@Page(PATH, { layout: 'docs' })
export class Browser implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Browser adapter',
      description: 'Run the app in the browser: the adapter that powers SPAs and hydrates server-rendered pages.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='Browser' />
        <Lead>
          <code>@stone-js/browser-adapter</code> makes the browser a context like any other. It
          captures browser causes, a navigation, a load, and drives the app client-side. Paired with
          use-react it powers SPAs, and stacked with a server adapter it hydrates SSR.
        </Lead>

        <H2>Install & enable</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/browser-adapter @stone-js/use-react`}</Code>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H2>SPA and hydration</H2>
        <p>
          Alone, the Browser adapter renders a pure client app (CSR). Stacked with a server or edge
          adapter, it hydrates the server-rendered HTML: the server context resolves the first paint,
          the browser context takes over. The rendering page covers the strategies in full.
        </p>
        <PropsTable rows={[
          { name: 'rendering: csr', type: 'browser only', desc: 'A pure SPA; the Browser adapter renders everything.' },
          { name: 'rendering: ssr + Browser', type: 'server + browser', desc: 'Server render, then the Browser adapter hydrates.' },
          { name: 'rendering: ssg + Browser', type: 'build + browser', desc: 'Static HTML, then hydrated on load.' }
        ]} />

        <H2>Browser primitives</H2>
        <p>
          The adapter builds on <code>@stone-js/browser-core</code>, the browser's runtime-agnostic
          event and response model, the counterpart of <code>http-core</code> on the server. You rarely
          touch it directly (pages and the event accessor cover day-to-day work), but it is what makes
          a browser navigation just another normalised intention.
        </p>
        <PropsTable rows={[
          { name: 'IncomingBrowserEvent', type: 'event', desc: 'A browser cause (navigation, load) as an intention your pages read with event.get().' },
          { name: 'OutgoingBrowserResponse', type: 'response', desc: 'The browser-side response the view is rendered from.' },
          { name: 'RedirectBrowserResponse', type: 'response', desc: 'A client-side redirect.' },
          { name: 'Cookie / CookieCollection', type: 'cookies', desc: 'Cookie access in the browser context.' }
        ]} nameHeader='browser-core' />

        <H2>Deploy</H2>
        <p>
          A CSR or SSG build is static assets: deploy <code>dist/</code> to any static host or CDN. An
          SSR build pairs these client assets with the server/edge adapter you stacked, deployed as
          that adapter dictates.
        </p>
        <Code file='terminal' lang='bash'>{`npm run build     # client bundle (+ static HTML for SSG)
npm run preview   # serve it locally`}</Code>

        <Callout kind='note' title='This site is a Browser + SSG app'>
          The documentation you are reading is exactly this: a use-react app rendered SSG and hydrated
          by the Browser adapter. The proof is the page.
        </Callout>

        <SeeAlso links={[
          { title: 'Frontend context', path: '/docs/contexts/frontend' },
          { title: 'Rendering: CSR, SSR, SSG', path: '/docs/frontend/rendering' },
          { title: 'Universal apps', path: '/docs/frontier/universal' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
