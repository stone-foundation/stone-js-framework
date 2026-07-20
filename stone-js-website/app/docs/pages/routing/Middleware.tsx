import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing/middleware'

const DECL = `
import { EventHandler, Get, Post, Delete } from '@stone-js/router'
import { requireAuth, requireScopes } from '@stone-js/auth'
import { authorize } from '@stone-js/authz'
import { validate } from '@stone-js/validation'

@EventHandler('/tasks', { middleware: [requireAuth()] })   // group-wide
export class TaskController {
  @Get('/')
  list () { /* just requireAuth, from the group */ }

  @Post('/', { middleware: [validate({ body: NewTask }), requireScopes('tasks:write')] })
  create (event) { /* group + route middleware, in order */ }

  @Delete('/:id', { middleware: [authorize('delete', 'Task')] })
  remove (event) { /* ... */ }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'
import { requireAuth, requireScopes } from '@stone-js/auth'
import { authorize } from '@stone-js/authz'
import { validate } from '@stone-js/validation'

export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'list'),
    { path: '/tasks', method: 'GET', middleware: [requireAuth()] }],
  [defineEventHandler(TaskController, 'create'),
    { path: '/tasks', method: 'POST', middleware: [requireAuth(), validate({ body: NewTask }), requireScopes('tasks:write')] }],
  [defineEventHandler(TaskController, 'remove'),
    { path: '/tasks/:id', method: 'DELETE', middleware: [requireAuth(), authorize('delete', 'Task')] }]
])
`

/**
 * Routing: route middleware.
 */
@Page(PATH, { layout: 'docs' })
export class Middleware implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Route middleware',
      description: 'Attach middleware per route or per group, in order, to guard and shape the path to a handler. Auth, authorization and validation are all middleware.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Route middleware' />
        <Lead>
          Middleware is where a route states its guarantees in plain sight: who may call it, what the
          input must look like, what happens around it. Auth, authorization and validation from the
          Build section are all just middleware attached here.
        </Lead>

        <H2>Attaching middleware</H2>
        <p>
          Add a <code>middleware</code> array to a route, a controller, or a group. Group middleware
          runs for every route inside; route middleware runs in addition, after the group's, in the
          order listed.
        </p>
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />

        <H2>Order and opting out</H2>
        <ul>
          <li><strong>Order</strong>: group middleware first, then route middleware, top to bottom. Put guards before transforms (authenticate, then validate).</li>
          <li><strong>Opt out</strong>: a route in a guarded group can drop an inherited middleware with <code>excludeMiddleware</code>.</li>
        </ul>
        <Code file='app/Tasks.ts'>{`@EventHandler('/tasks', { middleware: [requireAuth()] })
export class TaskController {
  // A public endpoint inside an otherwise-guarded controller.
  @Get('/public', { excludeMiddleware: [requireAuth] })
  public () { /* no auth here */ }
}`}</Code>

        <Callout kind='note' title='What middleware is'>
          A middleware is a pipe: it receives the event and a <code>next</code>, does work on the way
          in, and can act on the response on the way out. Return early to short-circuit. The
          Middleware concept page covers the model in full; this page is about attaching it to routes.
        </Callout>

        <SeeAlso links={[
          { title: 'Middleware & the pipeline', path: '/docs/foundations/middleware' },
          { title: 'Auth & authorization', path: '/docs/extensions/auth' },
          { title: 'Validation', path: '/docs/extensions/validation' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
