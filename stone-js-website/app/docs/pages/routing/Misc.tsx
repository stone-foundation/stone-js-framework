import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing/misc'

/**
 * Routing: misc (fallback, current route, the router in the browser).
 */
@Page(PATH, { layout: 'docs' })
export class Misc implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Routing: misc',
      description: 'The odds and ends: a fallback route, reading the current route, reaching the router, and how routing behaves in the browser.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Misc' />
        <Lead>
          A few smaller tools round out routing: catching unmatched requests, knowing which route is
          active, reaching the router directly, and understanding how the same routes drive the
          browser.
        </Lead>

        <H2>A fallback route</H2>
        <p>
          Give unmatched requests a home instead of a bare 404: a fallback route runs when nothing
          else matches. On the frontend it renders your not-found page; on an API it can return a
          shaped error payload.
        </p>
        <Code file='app/routes.ts'>{`@Any('*', { fallback: true })
notFound (event: IncomingHttpEvent) {
  return { error: 'not_found', path: event.get('path') }
}`}</Code>

        <H2>The current route</H2>
        <p>
          In a component, <code>useRoute()</code> returns the active route (its name, params and
          path), which is how you highlight the current nav item or read a param without prop
          drilling.
        </p>
        <Code file='app/pages/Nav.tsx' lang='tsx'>{`import { useRoute } from '@stone-js/use-react'

const route = useRoute()
const isActive = route?.name === 'tasks.list'`}</Code>

        <H2>Reaching the router</H2>
        <p>
          <code>useRouter()</code> (in components) or the injected router (in handlers and services)
          gives you the router itself, for URL generation and programmatic navigation.
        </p>
        <PropsTable nameHeader='Member' rows={[
          { name: 'router.generate(opts)', type: '(GenerateOptions) => string', desc: 'Build a URL from a route name, params and query.' },
          { name: 'router.match(event)', type: '(event) => Route', desc: 'Resolve the route for an event (advanced).' },
          { name: 'useRoute()', type: '() => Route | undefined', desc: 'The active route in a component.' },
          { name: 'useRouter()', type: '() => Router', desc: 'The router instance in a component.' }
        ]} />

        <H2>Routing in the browser</H2>
        <p>
          The same route table drives client-side navigation. <code>StoneLink</code> uses it to
          navigate without a full reload in SPA and SSR, and falls back to a normal link where that is
          right. You write routes once; they serve the server render and the in-browser transitions
          alike.
        </p>

        <Callout kind='future' title='One router, every context'>
          Nothing on this page is browser-only or server-only. That is the payoff of a universal
          router: the concepts you just learned are the same whether the cause is an HTTP request, a
          client navigation, or, through an adapter, an agent tool call.
        </Callout>

        <SeeAlso links={[
          { title: 'Named routes & URL generation', path: '/docs/routing/names' },
          { title: 'Frontend', path: '/docs/contexts/frontend' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
