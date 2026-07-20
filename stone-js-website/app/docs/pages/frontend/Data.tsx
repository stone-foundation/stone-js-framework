import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend/data'

const DECL = `
import { Page, IPage, ReactIncomingEvent } from '@stone-js/use-react'

@Page('/tasks/:id')
export class TaskPage implements IPage<ReactIncomingEvent> {
  // The loader: runs before render. On SSR it runs on the server; on a client
  // navigation it runs in the browser. Same code, either way.
  async handle (event: ReactIncomingEvent, { tasks }: { tasks: TaskService }) {
    return tasks.find(event.get('id'))
  }

  render ({ data }: { data: Task }) {
    return <h1>{data.title}</h1>
  }
}
`

const IMP = `
import { definePage } from '@stone-js/use-react'

const TaskPage = ({ tasks }) => ({
  handle: (event) => tasks.find(event.get('id')),
  render: ({ data }) => <h1>{data.title}</h1>
})

export const pages = [definePage(TaskPage, { path: '/tasks/:id' }, true)]
`

/**
 * Frontend: data fetching.
 */
@Page(PATH, { layout: 'docs' })
export class Data implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Data fetching',
      description: 'Load a page’s data with its handle loader; read it with useData. One loader serves the server render and client navigations alike.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='Data fetching' />
        <Lead>
          A page loads its data in one place: <code>handle</code>. That is the same loader whether the
          page is rendered on the server for the first paint or resolved in the browser on a client
          navigation, so there is no separate server codebase to keep in sync.
        </Lead>

        <H2>One loader, both sides</H2>
        <Principle
          principle={
            <p>
              Universal apps usually split data loading into "server" and "client" paths that drift
              apart. If one loader runs in both places, that drift is impossible: the page fetches its
              data the same way wherever it renders.
            </p>
          }
          incarnation={
            <p>
              A page's <code>handle</code> is an event handler: it reads the event, resolves services,
              returns data. On SSR it runs server-side and the result is serialised into the page; on a
              client navigation it runs in the browser. Its return is the render's <code>data</code>.
            </p>
          }
        />
        <CodeTabs file='app/pages/TaskPage.tsx' decl={DECL} imp={IMP} />

        <H2>Reading data</H2>
        <p>
          <code>render</code> receives <code>data</code> directly; deeper components read it with
          <code> useData()</code>, so you rarely thread it through props.
        </p>
        <Code file='app/pages/TaskMeta.tsx' lang='tsx'>{`import { useData } from '@stone-js/use-react'

export function TaskMeta () {
  const task = useData<Task>()
  return <small>Created {task?.createdAt}</small>
}`}</Code>

        <H3>Server-only loading</H3>
        <p>
          For work that must never run in the browser (secrets, a direct database call), a server
          loader keeps it server-side and hands the client only the result. Use it when
          <code> handle</code> would otherwise pull server-only code into the browser bundle.
        </p>
        <Code file='app/pages/ReportPage.tsx'>{`import { defineServerLoader } from '@stone-js/use-react'

export const loadReport = defineServerLoader(async ({ event, container }) => {
  return container.make('db').query('report', event.get('id'))   // server only
})`}</Code>

        <H2>Loading states</H2>
        <p>
          On the first paint (SSR/SSG) the data is already there, no spinner, no layout shift. On a
          client navigation, the loader runs before the new page shows; the current page stays put
          until it resolves, so there is no flash of empty UI. For slow loaders, render pending UI with
          React's ordinary tools (<code>Suspense</code>, a transition), the data layer does not fight
          them.
        </p>
        <Callout kind='important' title='Loaders run where you think'>
          Be deliberate about what a page loader touches. In an SSR app a naive <code>handle</code>
          runs in the browser on client navigations; keep server-only access behind a server loader,
          and validate any input the loader reads.
        </Callout>

        <SeeAlso links={[
          { title: 'Pages', path: '/docs/frontend/pages' },
          { title: 'Rendering: CSR, SSR, SSG', path: '/docs/frontend/rendering' },
          { title: 'Incoming event', path: '/docs/essentials/incoming-event' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
