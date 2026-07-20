import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing/groups'

const DECL = `
import { EventHandler, Get, Post } from '@stone-js/router'
import { requireAuth } from '@stone-js/auth'

// The controller is the group: a shared base path and shared options.
@EventHandler('/admin/tasks', { middleware: [requireAuth()] })
export class AdminTaskController {
  @Get('/')       list ()   { /* GET  /admin/tasks   (auth required) */ }
  @Post('/')      create () { /* POST /admin/tasks   (auth required) */ }
  @Get('/:id')    show ()   { /* GET  /admin/tasks/:id (auth required) */ }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'
import { requireAuth } from '@stone-js/auth'

// A group: shared path prefix and middleware via a parent with children.
export const routes = defineRoutes([
  [null, {
    path: '/admin/tasks',
    middleware: [requireAuth()],
    children: [
      [defineEventHandler(AdminTaskController, 'list'),   { path: '/',    method: 'GET' }],
      [defineEventHandler(AdminTaskController, 'create'), { path: '/',    method: 'POST' }],
      [defineEventHandler(AdminTaskController, 'show'),   { path: '/:id', method: 'GET' }]
    ]
  }]
])
`

/**
 * Routing: groups & prefixes.
 */
@Page(PATH, { layout: 'docs' })
export class Groups implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Groups & prefixes',
      description: 'Share a path prefix and options across many routes with a controller or a nested group, so common concerns are declared once.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Groups & prefixes' />
        <Lead>
          Related routes usually share a prefix and a set of concerns: an admin area behind auth, an
          API version, a resource. A group states those once and applies them to every route inside,
          so you never repeat a prefix or a guard.
        </Lead>

        <H2>The controller is a group</H2>
        <p>
          Declaratively, a controller <em>is</em> the group: its base path prefixes every method, and
          options set on <code>@EventHandler</code> (like middleware) apply to all of them.
          Imperatively, a parent entry with <code>children</code> does the same.
        </p>
        <CodeTabs file='app/AdminTasks.ts' decl={DECL} imp={IMP} />

        <H2>What a group shares</H2>
        <ul>
          <li><strong>Path prefix</strong>: each child path is appended to the group's base path.</li>
          <li><strong>Middleware</strong>: runs for every route in the group (a child can opt out with <code>excludeMiddleware</code>).</li>
          <li><strong>Constraints & defaults</strong>: <code>rules</code> and <code>defaults</code> cascade to children.</li>
          <li><strong>Domain & protocol</strong>: restrict a whole group to a host or scheme.</li>
        </ul>

        <Callout kind='note' title='Groups can nest'>
          A child of a group can itself be a group (via <code>children</code>), so an API can layer
          <code> /api</code> → <code>/api/v1</code> → a resource, each level adding its own prefix and
          middleware. Keep nesting shallow enough to stay readable.
        </Callout>

        <SeeAlso links={[
          { title: 'Route middleware', path: '/docs/routing/middleware' },
          { title: 'Route definitions', path: '/docs/routing/definitions' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
