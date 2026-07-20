import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend/navigation'

/**
 * Frontend: navigation.
 */
@Page(PATH, { layout: 'docs' })
export class Navigation implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Navigation',
      description: 'Move between pages with StoneLink or programmatically through the router, using the same routes the server render uses.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='Navigation' />
        <Lead>
          Navigation runs on the same universal router as everything else. In the browser it moves
          between pages without a full reload; on the server it produces the first render. You write
          links and calls once, and they behave correctly in every rendering mode.
        </Lead>

        <H2>Declarative: StoneLink</H2>
        <p>
          <code>StoneLink</code> is the link. In SPA and SSR it navigates client-side; where a real
          navigation is needed, it falls back to one. Give it a path or a generated URL.
        </p>
        <Code file='app/pages/Nav.tsx' lang='tsx'>{`import { StoneLink, useRouter, useRoute } from '@stone-js/use-react'

export function Nav () {
  const router = useRouter()
  const route = useRoute()
  return (
    <nav>
      <StoneLink to='/tasks' className={route?.name === 'tasks.list' ? 'active' : ''}>Tasks</StoneLink>
      <StoneLink to={router.generate({ name: 'tasks.show', params: { id: 1 } })}>First</StoneLink>
    </nav>
  )
}`}</Code>

        <H2>Programmatic navigation</H2>
        <p>
          When navigation follows an action, ask the router to navigate. Generate the target by name
          so the path stays in one place.
        </p>
        <Code file='app/pages/NewTask.tsx' lang='tsx'>{`const router = useRouter()

async function onSubmit (values: NewTask) {
  const task = await api.create(values)
  router.navigate(router.generate({ name: 'tasks.show', params: { id: task.id } }))
}`}</Code>

        <H3>Knowing where you are</H3>
        <p>
          <code>useRoute()</code> gives the active route, which is how you highlight the current link,
          read a param, or branch on the page. It updates as navigation happens.
        </p>

        <H2>Scroll restoration</H2>
        <p>
          Client navigation restores scroll position the way users expect: to the top on a new page,
          back to where they were on back/forward. Enable it once; it is not something you wire per
          link.
        </p>
        <Code file='app/client.ts'>{`import { setupScrollRestoration } from '@stone-js/use-react'

setupScrollRestoration()   // top on navigate, remembered position on back/forward`}</Code>

        <H2>View transitions</H2>
        <p>
          Animate between pages with the View Transitions API, a cross-fade, a shared element, without
          hand-rolling animation state. It degrades gracefully where the API is absent and respects
          <code> prefers-reduced-motion</code>.
        </p>
        <Code file='app/client.ts'>{`import { renderWithTransition } from '@stone-js/use-react'

// Wrap the render so route changes animate where the browser supports it.
renderWithTransition(app)`}</Code>

        <Callout kind='note' title='SPA feel, server-rendered first paint'>
          Scroll restoration and transitions give the smooth feel of an SPA, while the first paint
          still comes fully rendered from the server (or a static file). You give up neither.
        </Callout>

        <SeeAlso links={[
          { title: 'Components & links', path: '/docs/frontend/components' },
          { title: 'Named routes & URL generation', path: '/docs/routing/names' },
          { title: 'Rendering: CSR, SSR, SSG', path: '/docs/frontend/rendering' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
