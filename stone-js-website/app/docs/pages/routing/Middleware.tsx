import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

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

        <H2>Reading a parameter before the route is resolved</H2>
        <p>
          A kernel or group middleware runs before routing, so <code>event.getRoute()</code> has
          nothing to give yet, and even on the router layer the parameters are only bound after the
          route middleware have run. A guard that needs <code>:orgCode</code> used to do a three-line
          dance: find the route, bind it, read it. The router does the dance for you now, from any
          layer:
        </p>
        <Code file='app/middleware/OrganizationGuard.ts'>{`export class OrganizationGuard {
  constructor ({ router, organizations }) {
    this.router = router
    this.organizations = organizations
  }

  async handle (event, next) {
    const orgCode = await this.router.findParam(event, 'orgCode', '')
    if (orgCode !== '' && !await this.organizations.exists(orgCode)) {
      throw new NotFoundError('No organization ' + orgCode)
    }
    return next(event)
  }
}`}</Code>
        <PropsTable nameHeader='Method' rows={[
          { name: 'router.findParam(event, name, fallback?)', type: 'Promise<T>', desc: 'One parameter, from any layer. Answers the fallback when no route matches: the 404 belongs to the router at dispatch, not to whoever peeked.' },
          { name: 'router.getBoundRoute(event)', type: 'Promise<Route>', desc: 'The bound route itself, for reading several things. Throws RouteNotFoundError when nothing matches.' }
        ]} />
        <Callout kind='note' title='A peek, not a dispatch'>
          Nothing is emitted and the router's own resolution later proceeds as if nobody had looked.
          The match is remembered per event, so a guard reading <code>orgCode</code> and a locale
          middleware reading <code>lang</code> pay for one match, not two. Named in the{' '}
          <code>find*</code> family on purpose: <code>findParam</code> takes an event and may match,
          where <code>getParam</code> reads the already-dispatched current route.
        </Callout>

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
