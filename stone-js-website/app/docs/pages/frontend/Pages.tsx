import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend/pages'

const DECL = `
import { Page, IPage, ReactIncomingEvent, HeadContext } from '@stone-js/use-react'
import { JSX } from 'react'

@Page('/tasks')
export class TasksPage implements IPage<ReactIncomingEvent> {
  // Optional loader: runs before render (server or client).
  handle ({ tasks }: { tasks: TaskService }) {
    return tasks.list()
  }

  // Optional document head for this page.
  head (): HeadContext {
    return { title: 'Tasks', description: 'Everything to do.' }
  }

  // Required: return the view.
  render ({ data }: { data: Task[] }): JSX.Element {
    return <ul>{data.map((t) => <li key={t.id}>{t.title}</li>)}</ul>
  }
}
`

const IMP = `
import { definePage } from '@stone-js/use-react'

const TasksPage = ({ tasks }) => ({
  handle: () => tasks.list(),
  head: () => ({ title: 'Tasks', description: 'Everything to do.' }),
  render: ({ data }) => <ul>{data.map((t) => <li key={t.id}>{t.title}</li>)}</ul>
})

export const pages = [definePage(TasksPage, { path: '/tasks' }, true)]
`

/**
 * Frontend: pages.
 */
@Page(PATH, { layout: 'docs' })
export class Pages implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Pages',
      description: 'A page is a route that renders. Load data with handle, describe the head with head, return the view with render.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='Pages' />
        <Lead>
          A page is the frontend's handler: a route that resolves into a view. It shares the handler
          contract you already know, with one addition, <code>render</code>, and one convenience,
          <code> head</code>. Data still comes from <code>handle</code>.
        </Lead>

        <H2>The page contract</H2>
        <p>
          Mark a class with <code>@Page(path)</code> (or register a <code>definePage</code>). Three
          methods, all but <code>render</code> optional:
        </p>
        <PropsTable nameHeader='Method' rows={[
          { name: 'handle(context)', type: 'loader', desc: 'Load the page data before render; its return is available as data. Optional.' },
          { name: 'render(context)', type: 'view', required: true, desc: 'Return the React node. Receives { data, event, container, statusCode }.' },
          { name: 'head(context)', type: 'metadata', desc: 'Return the document head for this page (title, meta, ...). Optional.' }
        ]} />
        <CodeTabs file='app/pages/TasksPage.tsx' decl={DECL} imp={IMP} />

        <H3>The render context</H3>
        <p>
          <code>render</code> receives the data from <code>handle</code>, the event, the container and
          a status code. Reading data is usually done straight from the argument, or with
          <code> useData()</code> deeper in the tree.
        </p>

        <Callout kind='note' title='handle is the loader you already know'>
          A page's <code>handle</code> is the same event handler contract as the backend: it can read
          the event, resolve services, and return data. On SSR it runs on the server; on a client
          navigation it runs in the browser. See Data fetching.
        </Callout>

        <SeeAlso links={[
          { title: 'Layouts', path: '/docs/frontend/layouts' },
          { title: 'Data fetching', path: '/docs/frontend/data' },
          { title: 'Head & metadata', path: '/docs/frontend/head' },
          { title: 'Routing', path: '/docs/routing' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
