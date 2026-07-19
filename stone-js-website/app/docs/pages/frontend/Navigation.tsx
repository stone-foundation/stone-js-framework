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

        <Callout kind='note' title='Scroll and transitions'>
          Client navigation restores scroll position sensibly and can animate transitions; both
          respect <code>prefers-reduced-motion</code>. You get the smooth feel of an SPA without giving
          up the server-rendered first paint.
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
