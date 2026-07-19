import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/middleware/registering'

const DECL = `
import { StoneApp, Middleware } from '@stone-js/core'

// Global: runs for every event. 'global: true' registers it kernel-wide.
@Middleware({ global: true, priority: 10 })
export class RequestId { /* ... */ }
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { requestId } from './middleware/requestId'

export const App = defineStoneApp(
  { name: 'tasks', middleware: [requestId] },   // global middleware
  [/* blueprints */]
)
`

/**
 * Middleware: registering.
 */
@Page(PATH, { layout: 'docs' })
export class Registering implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Registering middleware',
      description: 'Attach middleware globally, per route, or per group; control order with priority; alias it; and opt routes out.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Middleware' title='Registering middleware' />
        <Lead>
          The same pipe can run for the whole app, for one group, or for a single route. Where you
          attach it decides its scope; a couple of options decide its order and let routes opt out.
        </Lead>

        <H2>Scopes</H2>
        <PropsTable nameHeader='Scope' rows={[
          { name: 'Global', type: 'app / kernel', desc: 'Runs for every event. Set on the app (stone.middleware) or mark the middleware global.' },
          { name: 'Group', type: 'controller / children', desc: "In a controller's or group's middleware array; runs for its routes." },
          { name: 'Route', type: 'per route', desc: "In a route's middleware array; runs for that route only." }
        ]} />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H3>Per route and per group</H3>
        <Code file='app/Tasks.ts'>{`@EventHandler('/tasks', { middleware: [requireAuth()] })   // whole controller
export class TaskController {
  @Post('/', { middleware: [validate({ body: NewTask })] })  // one route, in addition
  create (event) { /* ... */ }
}`}</Code>

        <H2>Order, priority and opting out</H2>
        <ul>
          <li><strong>Order</strong>: global first, then group, then route; within a list, top to bottom.</li>
          <li><strong>Priority</strong>: give a middleware a <code>priority</code> to move it earlier or later among its peers.</li>
          <li><strong>Alias</strong>: register a middleware under an <code>alias</code> and refer to it by name where that reads better.</li>
          <li><strong>Opt out</strong>: a route can drop an inherited middleware with <code>excludeMiddleware</code>.</li>
        </ul>
        <Code file='app/Tasks.ts'>{`@Get('/public', { excludeMiddleware: [requireAuth] })   // skip the group's guard here
public () { /* no auth */ }`}</Code>

        <PropsTable rows={[
          { name: 'global', type: 'boolean', default: 'false', desc: 'Register as kernel-wide middleware.' },
          { name: 'priority', type: 'number', desc: 'Execution order among peers (lower runs earlier).' },
          { name: 'alias', type: 'string | string[]', desc: 'Name(s) to reference the middleware by.' },
          { name: 'params', type: 'unknown[]', desc: 'Arguments passed to the middleware.' }
        ]} />

        <Callout kind='note' title='Guards before transforms'>
          Order matters: authenticate before you authorize, authorize before you validate, validate
          before the handler. Priority is the lever when the default order is not enough.
        </Callout>

        <SeeAlso links={[
          { title: 'Route middleware', path: '/docs/routing/middleware' },
          { title: 'Terminating middleware', path: '/docs/middleware/terminating' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
