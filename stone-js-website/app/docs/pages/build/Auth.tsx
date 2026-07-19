import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/build/auth'

const DECL = `
import { EventHandler, Get, Post, Delete } from '@stone-js/router'
import { requireAuth, requireScopes } from '@stone-js/auth'
import { authorize } from '@stone-js/authz'

@EventHandler('/tasks')
export class TaskController {
  private readonly tasks: TaskService
  constructor ({ tasks }: { tasks: TaskService }) { this.tasks = tasks }

  @Get('/', { middleware: [requireAuth()] })
  list () { return this.tasks.list() }

  @Post('/', { middleware: [requireScopes('tasks:write')] })
  create (event) { return this.tasks.add(event.get('title')) }

  @Delete('/:id', { middleware: [authorize('delete', 'Task')] })
  remove (event) { return this.tasks.remove(event.get('id')) }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'
import { requireAuth, requireScopes } from '@stone-js/auth'
import { authorize } from '@stone-js/authz'

export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'list'),
    { path: '/tasks', method: 'GET', middleware: [requireAuth()] }],
  [defineEventHandler(TaskController, 'create'),
    { path: '/tasks', method: 'POST', middleware: [requireScopes('tasks:write')] }],
  [defineEventHandler(TaskController, 'remove'),
    { path: '/tasks/:id', method: 'DELETE', middleware: [authorize('delete', 'Task')] }]
])
`

/**
 * Build: authentication and authorization.
 */
@Page(PATH, { layout: 'docs' })
export class Auth implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Auth & authorization',
      description: 'Stateless authentication on JWT/OAuth, plus isomorphic RBAC and ABAC: the same rules guard the API and shape the UI.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Build' title='Auth & authorization' />
        <Lead>
          Two distinct questions, kept distinct. Authentication asks who is calling. Authorization
          asks what they are allowed to do. Stone.js answers both as middleware, so a route states
          its guarantees on its own line, in plain sight.
        </Lead>

        <H2>Authentication: who is calling</H2>
        <Principle
          principle={
            <p>
              Identity should be established at the boundary and carried as context, never
              re-derived deep in the code. State kept on the server ties you to one machine; a
              token verified at the edge travels anywhere the request does.
            </p>
          }
          incarnation={
            <p>
              <code>@stone-js/auth</code> is stateless, built on JWT and OAuth (via jose), so it
              runs on the edge with no session store. <code>requireAuth()</code> guards a route;
              <code> requireScopes(...)</code> demands specific OAuth scopes. Anonymous calls get a
              <code> 401</code>, missing scopes a <code>403</code>.
            </p>
          }
        />

        <H2>Authorization: what they may do</H2>
        <p>
          <code>@stone-js/authz</code> is isomorphic: the same rules run on the server to guard a
          route and in the browser to show or hide a control. Declare abilities once, enforce them
          with <code>authorize(action, subject)</code>.
        </p>
        <Code file='app/abilities.ts'>{`import { defineAbility } from '@stone-js/authz'

export const ability = defineAbility((can, user) => {
  can('read', 'Task')
  if (user.role === 'admin') can('delete', 'Task')
  can('update', 'Task', { ownerId: user.id })   // ABAC: attribute-based
})`}</Code>
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />

        <H3>The same rule in the UI</H3>
        <p>
          Because the ability is a value, the frontend asks the same question before rendering a
          button, so the UI never offers an action the API would refuse.
        </p>
        <Code file='app/pages/TaskRow.tsx'>{`{ability.can('delete', task) && <button onClick={remove}>Delete</button>}`}</Code>

        <Aphorism>One rule set. It guards the route and shapes the UI. The two can never disagree.</Aphorism>

        <Callout kind='future' title='Guards that follow the domain to the edge'>
          Nothing here touches a session table or a server-bound store. The token is verified and
          the ability evaluated wherever the code runs, so the same guarantees hold on Node, on a
          Worker, and in an agent call.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
