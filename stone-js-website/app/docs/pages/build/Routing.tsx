import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/build/routing'

const DECL = `
import { IncomingHttpEvent } from '@stone-js/http-core'
import { EventHandler, Get, Post } from '@stone-js/router'

@EventHandler('/tasks')
export class TaskController {
  private readonly tasks: TaskService
  constructor ({ tasks }: { tasks: TaskService }) { this.tasks = tasks }

  @Get('/')
  list (event: IncomingHttpEvent): Task[] {
    return this.tasks.list(event.get<boolean>('done'))
  }

  @Get('/:id')
  show (event: IncomingHttpEvent): Task | undefined {
    return this.tasks.find(event.get<string>('id'))
  }

  @Post('/', { name: 'tasks.create' })
  create (event: IncomingHttpEvent): Task {
    return this.tasks.add(event.get<string>('title'))
  }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'

const TaskController = ({ tasks }) => ({
  list:   (event) => tasks.list(event.get('done')),
  show:   (event) => tasks.find(event.get('id')),
  create: (event) => tasks.add(event.get('title'))
})

export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'list'),   { path: '/tasks',     method: 'GET' }],
  [defineEventHandler(TaskController, 'show'),   { path: '/tasks/:id', method: 'GET' }],
  [defineEventHandler(TaskController, 'create'), { path: '/tasks', method: 'POST', name: 'tasks.create' }]
])
`

/**
 * Build: routing.
 */
@Page(PATH, { layout: 'docs' })
export class Routing implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Routing',
      description: 'One universal router maps intentions to handlers, the same way on Node, the edge and the browser.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Build' title='Routing' />
        <Lead>
          A router maps an intention to the code that answers it. Stone.js has one router, and it
          works identically wherever the app runs: the routes you write for a Node service are the
          routes that drive navigation in the browser.
        </Lead>

        <H2>Handlers and methods</H2>
        <p>
          Group related routes under a handler, then bind methods to verbs and paths. Values come
          off the event with <code>event.get()</code>, never off a platform request object.
        </p>
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />

        <H3>Parameters and names</H3>
        <ul>
          <li><strong>Path params</strong>: <code>/tasks/:id</code>, read with <code>event.get('id')</code>.</li>
          <li><strong>Query and body</strong>: same accessor, <code>event.get('title')</code>, transport-agnostic.</li>
          <li><strong>Named routes</strong>: give a route a <code>name</code> and generate URLs from it, so links never hard-code paths.</li>
        </ul>

        <H2>Middleware on a route</H2>
        <p>
          Cross-cutting concerns attach as middleware, per route or per handler. This is the seam
          every recipe that follows plugs into: validation, auth and authorization are all just
          middleware on the way to your method.
        </p>
        <CodeTabs
          file='app/Tasks.ts'
          decl={`@Post('/', { middleware: [requireAuth()] })
create (event) { /* ... */ }`}
          imp={`[defineEventHandler(TaskController, 'create'),
  { path: '/tasks', method: 'POST', middleware: [requireAuth()] }]`}
        />

        <Aphorism>The route names the intention. The middleware guards the path to it. The method is your domain.</Aphorism>

        <Callout kind='future' title='The same routes drive the browser'>
          On the frontend, these are not a separate concept. A page is a route that resolves into a
          view, and client-side navigation runs through this exact router. Learn it once here, use
          it in the frontend context unchanged.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
