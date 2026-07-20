import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/frontier/universal'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'

@Browser()    // resolve in the browser (hydration, client nav)
@NodeHttp()   // ...and on the server (first paint)
@UseReact()
@Routing()
@StoneApp()
export class Application {}
`

const IMP = `
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
 * Frontier: universal apps as superposition.
 */
@Page(PATH, { layout: 'docs' })
export class Universal implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Universal apps',
      description: 'SSR is not a mode you switch on. It is two contexts, server and browser, superposed on one domain and collapsing in sequence.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontier' title='Universal apps' />
        <Lead>
          Server-side rendering is usually sold as a special build with its own rules. Under the
          Continuum it is something simpler and stranger: the same pages, resolved by two contexts,
          one after the other. Once you see it that way, hydration stops being magic.
        </Lead>

        <H2>SSR is a superposition</H2>
        <Principle
          principle={
            <p>
              A page rendered on the server and then made interactive in the browser was resolved
              twice: first by a server context for the initial HTML, then by a browser context for
              everything after. Same component, two measurements.
            </p>
          }
          incarnation={
            <p>
              You do not configure an "SSR mode". You stack a server adapter and the Browser adapter
              on one app. The server context collapses the first paint; the browser context collapses
              the rest. The pages never know which one is running them.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H2>Why this is more than a trick</H2>
        <p>
          Because both resolutions run the same domain, there is no separate server codebase to keep
          in sync with the client. A loader that fills a page on the server is the same loader that
          fills it on a client navigation. The seam between server and browser, the usual source of
          universal-app bugs, is gone by construction.
        </p>

        <Aphorism>The first paint and the first interaction are the same page, collapsed by two contexts in a row.</Aphorism>

        <Callout kind='future' title='Move the first collapse to the edge'>
          Swap the server adapter for the fetch adapter and the first paint now happens on a
          Worker, milliseconds from the user, while the browser still owns everything after. Same
          pages, same domain: you moved a context, not a codebase.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
