import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Pager } from '../../components/content'

const PATH = '/docs/contexts/frontend'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'

@Browser()   // run in the browser
@UseReact()  // render with React
@Routing()
@StoneApp()
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
 * Contexts: the frontend (React, CSR/SSR/SSG).
 */
@Page(PATH, { layout: 'docs' })
export class Frontend implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Frontend',
      description: 'The same framework on the frontend: React pages and layouts, rendered CSR, SSR or SSG, choosing the strategy at build, not in your code.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Contexts' title='Frontend' />
        <Lead>
          Here is where "one framework for backend and frontend" stops being a slogan. The
          browser is just another context: the same kernel, the same routing, the same
          dependency injection, now producing views. This very site is built with it.
        </Lead>

        <H2>Pages are handlers that render</H2>
        <Principle
          principle={
            <p>
              A page is a request that resolves into a view. It has the same shape as any other
              handler: it can load data, respond to context, and return a result. The only
              difference is that the result is UI.
            </p>
          }
          incarnation={
            <p>
              In Stone.js a page is a class with <code>@Page(path)</code> and a <code>render()</code>.
              It may add <code>handle()</code> to load data and <code>head()</code> for the document
              head. Layouts wrap pages through <code>@PageLayout</code> and a <code>StoneOutlet</code>.
            </p>
          }
        />
        <Code file='app/pages/TasksPage.tsx'>{`@Page('/tasks')
export class TasksPage {
  handle ({ tasks }) { return tasks.all() }        // load data (server or client)

  render ({ data }) {
    return <ul>{data.map((t) => <li key={t.id}>{t.title}</li>)}</ul>
  }
}`}</Code>

        <H2>Collapse it into the browser</H2>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H2>One code, three rendering strategies</H2>
        <p>
          CSR, SSR and SSG are not three ways to write your app. They are three ways to
          <em> resolve</em> the same pages. You choose in configuration; the pages do not change.
        </p>
        <Code file='stone.config.mjs' lang='js'>{`export default defineConfig({
  rendering: 'ssg'   // or 'ssr', or 'csr'
})`}</Code>
        <H3>Which one when</H3>
        <ul>
          <li><strong>CSR</strong>: a pure SPA, rendered in the browser. Add the Browser adapter.</li>
          <li><strong>SSR</strong>: rendered on a server per request, then hydrated. Stack a backend or edge adapter with the Browser adapter.</li>
          <li><strong>SSG</strong>: pre-rendered to static HTML at build, hydrated on load. This site.</li>
        </ul>

        <Callout kind='note' title='use-view, under use-react'>
          React sits on <code>@stone-js/use-view</code>, a view-engine layer that is itself
          framework-agnostic. React is the first incarnation; the seam is deliberately open for
          other view libraries.
        </Callout>

        <Callout kind='future' title='SSR is a superposition, not a mode'>
          An SSR app is not a special build. It is a Browser adapter and a server adapter stacked
          on one domain: the server resolves the first paint, the browser resolves the rest. Same
          pages, two contexts, collapsing in sequence. The edge context makes this vivid next.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
