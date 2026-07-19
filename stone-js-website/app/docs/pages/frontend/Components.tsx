import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend/components'

/**
 * Frontend: components, links and hooks.
 */
@Page(PATH, { layout: 'docs' })
export class Components implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Components & links',
      description: 'Plain React components, plus the framework primitives (StoneLink, StoneOutlet, StonePage) and the hooks that reach the app from a component.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='Components & links' />
        <Lead>
          Below pages and layouts, you write ordinary React components. The framework adds a few
          primitives for links and outlets, and a set of hooks so a component can reach the router,
          the container, config and the current data without prop drilling.
        </Lead>

        <H2>Framework components</H2>
        <PropsTable nameHeader='Component' rows={[
          { name: '<StoneLink to={} />', type: 'link', desc: 'Client-side navigation in SPA/SSR, a normal link where that is right.' },
          { name: '<StoneOutlet>', type: 'outlet', desc: 'Where a layout renders its page.' },
          { name: '<StonePage />', type: 'page mount', desc: 'Mounts a resolved page (advanced; used internally and for custom shells).' }
        ]} />
        <Code file='app/pages/TaskRow.tsx' lang='tsx'>{`import { StoneLink } from '@stone-js/use-react'

export function TaskRow ({ task }: { task: Task }) {
  return <StoneLink to={\`/tasks/\${task.id}\`}>{task.title}</StoneLink>
}`}</Code>

        <H2>Hooks</H2>
        <p>
          Hooks are how a component reaches the application. They work the same on the server render
          and in the browser.
        </p>
        <PropsTable nameHeader='Hook' rows={[
          { name: 'useData<T>()', type: '() => T', desc: 'The current page data (from the page handle).' },
          { name: 'useRoute()', type: '() => Route', desc: 'The active route: name, params, path.' },
          { name: 'useRouter()', type: '() => Router', desc: 'The router: generate URLs, navigate.' },
          { name: 'useHead(head)', type: '(head) => void', desc: 'Set document head from within a component.' },
          { name: 'useConfig()', type: '() => Config', desc: 'The read-only Blueprint config.' },
          { name: 'useService(alias)', type: '(alias) => T', desc: 'Resolve a service from the container.' },
          { name: 'useContainer()', type: '() => Container', desc: 'The container itself (advanced).' },
          { name: 'useEventEmitter()', type: '() => Emitter', desc: 'Emit and listen to domain events.' }
        ]} />
        <Code file='app/pages/TaskCount.tsx' lang='tsx'>{`import { useData, useRouter } from '@stone-js/use-react'

export function TaskCount () {
  const tasks = useData<Task[]>() ?? []
  const router = useRouter()
  return <a href={router.generate({ name: 'tasks.list' })}>{tasks.length} tasks</a>
}`}</Code>

        <H3>Everything else is React</H3>
        <p>
          Beyond these, there is nothing special: your components are plain React, free to use hooks,
          context and libraries as usual. The framework primitives exist only where the app boundary
          needs to show through.
        </p>

        <Callout kind='note' title='Prefer StoneLink for internal links'>
          Use <code>StoneLink</code> for in-app navigation so it stays client-side where possible and
          falls back correctly elsewhere. Reserve plain <code>&lt;a&gt;</code> for external links.
        </Callout>

        <SeeAlso links={[
          { title: 'Navigation', path: '/docs/frontend/navigation' },
          { title: 'Data fetching', path: '/docs/frontend/data' },
          { title: 'Named routes & URL generation', path: '/docs/routing/names' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
