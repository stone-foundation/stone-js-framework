import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing'

const DECL = `
import { EventHandler, Get, Post } from '@stone-js/router'
import { IncomingHttpEvent } from '@stone-js/http-core'

@EventHandler('/tasks')                 // a controller: a base path + its routes
export class TaskController {
  constructor ({ tasks }: { tasks: TaskService }) { this.tasks = tasks }

  @Get('/')                             // GET /tasks
  list (event: IncomingHttpEvent) { return this.tasks.list() }

  @Post('/', { name: 'tasks.create' })  // POST /tasks, a named route
  create (event: IncomingHttpEvent) { return this.tasks.add(event.get<string>('title')) }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'

const TaskController = ({ tasks }) => ({
  list: () => tasks.list(),
  create: (event) => tasks.add(event.get('title'))
})

export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'list'),   { path: '/tasks', method: 'GET' }],
  [defineEventHandler(TaskController, 'create'), { path: '/tasks', method: 'POST', name: 'tasks.create' }]
])
`

/**
 * Routing: overview and section map.
 */
@Page(PATH, { layout: 'docs' })
export class Overview implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Routing overview',
      description: 'One universal router maps intentions to handlers, the same way on the server, the edge and the browser. Start here, then go deep.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Routing' />
        <Lead>
          A router maps an intention to the code that answers it. Stone.js has one router, and it
          behaves identically wherever the app runs: the routes you write for a Node service are the
          routes that drive navigation in the browser. This section covers it end to end.
        </Lead>

        <H2>The mental model</H2>
        <p>
          Every route is a pairing: a way to recognise an intention (a method and a path pattern) and
          a handler to run when it matches. The handler reads values off the event and returns data;
          it never touches a platform request object. That is what keeps the same routes valid across
          every context.
        </p>
        <Aphorism>A route names an intention. A handler answers it. Everything else in this section is detail on those two.</Aphorism>

        <H2>Define a route</H2>
        <p>
          Group related routes under a controller with a base path, then bind methods to verbs and
          sub-paths. Both paradigms produce the same routes.
        </p>
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />

        <H2>What the section covers</H2>
        <p>
          Routing is large, so it is split into focused pages. Read them in order for a full tour, or
          jump to what you need:
        </p>
        <SeeAlso links={[
          { title: 'Route definitions', path: '/docs/routing/definitions' },
          { title: 'Parameters & constraints', path: '/docs/routing/parameters' },
          { title: 'Query & body', path: '/docs/routing/query-body' },
          { title: 'Model binding', path: '/docs/routing/binding' },
          { title: 'Groups & prefixes', path: '/docs/routing/groups' },
          { title: 'Named routes & URL generation', path: '/docs/routing/names' },
          { title: 'Route middleware', path: '/docs/routing/middleware' },
          { title: 'Redirects & responses', path: '/docs/routing/redirects' },
          { title: 'Matching & precedence', path: '/docs/routing/matching' },
          { title: 'Misc: fallback, current route, useRouter', path: '/docs/routing/misc' }
        ]} />

        <Callout kind='note' title='Enable the router'>
          Routing is a blueprint you add to the app: <code>@Routing()</code> (declarative) or
          <code> routerBlueprint</code> (imperative), alongside an adapter. The rest of this section
          assumes it is enabled.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
