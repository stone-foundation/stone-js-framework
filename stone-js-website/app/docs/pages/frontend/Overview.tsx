import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'

@Browser()   // run in the browser
@UseReact()  // render with React
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
 * Frontend: overview and section map.
 */
@Page(PATH, { layout: 'docs' })
export class Overview implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Frontend overview',
      description: 'The view dimension: React pages and layouts on one universal kernel, rendered CSR, SSR or SSG. This site is built with it.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='Frontend' />
        <Lead>
          The frontend is another context, not another framework. The same kernel, routing and
          dependency injection you use on the server now produce views. <code>@stone-js/use-react</code>
          is the React incarnation of the view dimension, and this documentation site is built with it.
        </Lead>

        <H2>Enable React</H2>
        <p>
          Add the React view engine and a browser adapter to the manifest. Everything in this section
          assumes these are in place; where you render (CSR, SSR, SSG) is a separate choice covered on
          the rendering page.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />
        <Aphorism>A page is a route that resolves into a view. Same kernel, same routing, a different kind of result.</Aphorism>

        <H2>What the section covers</H2>
        <SeeAlso links={[
          { title: 'Pages', path: '/docs/frontend/pages' },
          { title: 'Layouts', path: '/docs/frontend/layouts' },
          { title: 'Components & links', path: '/docs/frontend/components' },
          { title: 'Navigation', path: '/docs/frontend/navigation' },
          { title: 'Data fetching', path: '/docs/frontend/data' },
          { title: 'Head & metadata', path: '/docs/frontend/head' },
          { title: 'Error pages', path: '/docs/frontend/error-pages' },
          { title: 'Assets', path: '/docs/frontend/assets' },
          { title: 'Rendering: CSR, SSR, SSG', path: '/docs/frontend/rendering' },
          { title: 'use-view', path: '/docs/frontend/use-view' }
        ]} />

        <Callout kind='note' title='The Contexts overview complements this'>
          The <a href='/docs/contexts/frontend'>Frontend context</a> page frames the frontend within
          the Continuum; this section is the implementation manual. Read the context page for the why,
          these pages for the how.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
