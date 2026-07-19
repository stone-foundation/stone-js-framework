import { JSX } from 'react'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend/use-view'

/**
 * Frontend: use-view (the engine layer).
 */
@Page(PATH, { layout: 'docs' })
export class UseView implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'use-view',
      description: 'The framework-agnostic view engine beneath use-react: pages, layouts, head and rendering as a contract, with React as the first incarnation.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='use-view' />
        <Lead>
          <code>@stone-js/use-react</code> is not the view dimension itself; it is React's incarnation
          of it. Underneath sits <code>@stone-js/use-view</code>, a view engine that is agnostic of any
          particular UI library. Knowing it is there explains why the frontend feels like the rest of
          the framework.
        </Lead>

        <H2>The view as a contract</H2>
        <Principle
          principle={
            <p>
              A view layer bolted to one UI library ties the framework's fate to that library. Define
              the view dimension as a contract, pages, layouts, head, rendering, and any library can
              incarnate it, the same way any platform can be an adapter.
            </p>
          }
          incarnation={
            <p>
              <code>use-view</code> owns the runtime-agnostic pieces: the <code>HeadContext</code>, the
              view-provider concept, the render and prerender contracts. <code>use-react</code> plugs
              React into that contract. The seam is deliberate and open.
            </p>
          }
        />
        <Aphorism>use-react is to use-view what a platform adapter is to the kernel: one incarnation of an open contract.</Aphorism>

        <H2>What lives where</H2>
        <ul>
          <li><strong>use-view</strong>: the <code>HeadContext</code>, view providers, the render / prerender / server-loader contracts, the SSG target.</li>
          <li><strong>use-react</strong>: <code>@Page</code>, <code>@PageLayout</code>, <code>@ErrorPage</code>, <code>StoneLink</code>/<code>StoneOutlet</code>, the hooks, React rendering and hydration.</li>
        </ul>

        <H2>Why it matters to you</H2>
        <p>
          In day-to-day work you use <code>use-react</code> and rarely touch <code>use-view</code>
          directly. But the split is the reason the frontend is a first-class context rather than an
          add-on, and the reason a future view library could join without disturbing the kernel or your
          domain.
        </p>

        <Callout kind='future' title='Another view library could plug in'>
          Because the view dimension is a contract, nothing about the architecture is React-specific.
          React is simply the first, most complete incarnation. This is the same openness that lets a
          new runtime arrive as an adapter, applied to the view.
        </Callout>

        <SeeAlso links={[
          { title: 'Frontend overview', path: '/docs/frontend' },
          { title: 'Adapters', path: '/docs/foundations/adapters' },
          { title: 'Write your own adapter', path: '/docs/extending/adapter' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
