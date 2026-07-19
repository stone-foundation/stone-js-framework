import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/authorization'

const DECL = `
import { EventHandler, Delete } from '@stone-js/router'
import { authorize } from '@stone-js/authz'

@EventHandler('/tasks')
export class TaskController {
  @Delete('/:id', { middleware: [authorize('delete', 'Task')] })
  remove (event) { return this.tasks.remove(event.get('id')) }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'
import { authorize } from '@stone-js/authz'

export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'remove'),
    { path: '/tasks/:id', method: 'DELETE', middleware: [authorize('delete', 'Task')] }]
])
`

/**
 * Extensions: authorization.
 */
@Page(PATH, { layout: 'docs' })
export class Authorization implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Authorization',
      description: 'Isomorphic RBAC and ABAC: declare abilities once, enforce them on the API and reuse the exact same rules to shape the UI.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Authorization' />
        <Lead>
          Authorization asks the second question: what may the caller do. <code>@stone-js/authz</code>
          answers it with rules that run on both sides, so the server guard and the UI that hides a
          button are the same logic, and can never disagree.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/authz`}</Code>

        <H2>Declare abilities once</H2>
        <Principle
          principle={
            <p>
              When the rule that guards an action lives in one place and the rule that shows its button
              lives in another, they drift, and the UI eventually offers what the API refuses. Declare
              the rule once and evaluate it in both places.
            </p>
          }
          incarnation={
            <p>
              <code>defineAbility</code> declares what a user can do, combining role checks (RBAC) and
              attribute checks (ABAC). <code>authorize(action, subject)</code> enforces it as route
              middleware; the same ability object answers <code>can(...)</code> in the UI.
            </p>
          }
        />
        <Code file='app/abilities.ts'>{`import { defineAbility } from '@stone-js/authz'

export const ability = defineAbility((can, user) => {
  can('read', 'Task')                          // everyone can read
  if (user.role === 'admin') can('delete', 'Task')   // RBAC
  can('update', 'Task', { ownerId: user.id })  // ABAC: only your own
})`}</Code>

        <H2>Enforce on the API</H2>
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />

        <H3>Reuse in the UI</H3>
        <p>
          Because the ability is a value, the frontend asks the same question before rendering a
          control, so the UI never offers an action the API would reject.
        </p>
        <Code file='app/pages/TaskRow.tsx' lang='tsx'>{`{ability.can('delete', task) && <button onClick={remove}>Delete</button>}`}</Code>
        <Aphorism>One rule set. It guards the route and shapes the UI. The two can never disagree.</Aphorism>

        <Callout kind='future' title='Guards that follow the domain to the edge'>
          Abilities are plain evaluations with no server-bound store, so the same rules hold on Node,
          on a Worker, and in an agent call. Authorization travels with the domain.
        </Callout>

        <SeeAlso links={[
          { title: 'Auth', path: '/docs/extensions/auth' },
          { title: 'Route middleware', path: '/docs/routing/middleware' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
