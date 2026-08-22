import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

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

        <H2>Enabling it</H2>
        <p>
          Enabled the way every Stone.js module is, with its decorator or with its blueprint. Either
          one registers the authorization provider and the kernel middleware that builds the caller's abilities for each request.
        </p>
        <CodeTabs
          file='app/Application.ts'
          decl={`import { Authz } from '@stone-js/authz'
import { StoneApp } from '@stone-js/core'

@Authz()
@StoneApp({ name: 'my-app' })
export class Application {}`}
          imp={`import { defineStoneApp } from '@stone-js/core'
import { authzBlueprint } from '@stone-js/authz'

export const Application = defineStoneApp({ name: 'my-app' }, [authzBlueprint])`}
        />

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
        <p>
          Under the hood it is <a href='https://casl.js.org' target='_blank' rel='noopener noreferrer'>CASL</a>,
          so you get RBAC (action + subject type), ABAC (conditions on a subject instance) and
          field-level rules from one declaration, and the same ability runs on the server and in the
          browser.
        </p>
        <Code file='app/abilities.ts'>{`import { defineAbility } from '@stone-js/authz'

export const abilityFor = (user) => defineAbility((can, cannot) => {
  can('read', 'Task')                              // RBAC: anyone reads
  can('update', 'Task', { ownerId: user.id })      // ABAC: only your own
  can('update', 'Task', ['title', 'done'])         // field-level: only these fields
  if (user.role === 'admin') can('manage', 'Task') // 'manage' = every action
  cannot('delete', 'Task', { locked: true })       // an explicit exception
})`}</Code>

        <H3>RBAC, ABAC, fields, aliases</H3>
        <PropsTable nameHeader='Capability' rows={[
          { name: "can('delete', 'Task')", type: 'RBAC', desc: 'Allow an action on a subject type.' },
          { name: "can('update', 'Task', { ownerId })", type: 'ABAC', desc: 'Allow only when the subject instance matches the conditions.' },
          { name: "can('update', 'Task', ['title'])", type: 'field-level', desc: 'Restrict an action to specific fields.' },
          { name: "can('manage', subject)", type: 'action alias', desc: "'manage' matches every action; define your own aliases with createAliasResolver." },
          { name: "cannot('delete', 'Task', {...})", type: 'exception', desc: 'Carve out a denial that overrides a broader allow.' }
        ]} />

        <H2>Enforce on the API</H2>
        <p>
          <code>authorize(action, subject, field?)</code> guards a route and throws a
          <code> ForbiddenError</code> (403) when the ability says no. For checks inside a handler,
          inject the <code>Authorizer</code>: it exposes <code>can</code>/<code>cannot</code> and an
          <code> authorize</code> that throws.
        </p>
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />
        <Code file='app/Tasks.ts'>{`update (event: IncomingHttpEvent) {
  const task = this.tasks.find(event.get('id'))
  // Check against a concrete instance (ABAC) with subject() typing.
  this.authorizer.authorize(event.get('user'), 'update', subject('Task', task))
  return this.tasks.update(task, event.get('body'))
}`}</Code>

        <H3>A policy reads its own event, and holds its own services</H3>
        <p>
          A policy answers what <em>this</em> caller may do to <em>this</em> record, so it usually needs
          both the event and whatever loads the record. It says which event it reads, and the container
          builds it like any other class:
        </p>
        <Code file='app/policies/PostPolicy.ts'>{`@Policy('post.update')
export class PostPolicy implements IPolicy<IncomingHttpEvent> {
  constructor ({ posts }) { this.posts = posts }        // resolved, like any service

  async authorize (event: IncomingHttpEvent): Promise<boolean> {
    const post = await this.posts.find(event.get('id'))
    return post.authorId === event.getUser<Actor>()?.id
  }
}`}</Code>
        <p>
          The type parameter is what makes <code>implements</code> usable at all: without it, narrowing
          the parameter is rejected under a strict configuration and the clause has to be dropped. It
          defaults to the agnostic <code>IncomingEvent</code>, so a policy that reads nothing
          platform-specific writes nothing. <code>IAuthorizer&lt;User&gt;</code> does the same for a
          custom authorizer that reasons about your own user type.
        </p>
        <Callout kind='note' title='A declaration is a service'>
          <code>@Policy</code> declares three things at once: the class is a singleton service (so that
          constructor works), it is bound under the prefixed alias <code>policy:post.update</code>, and
          it activates the module. Prefixed on purpose: a policy named after a domain concept must not
          compete with your own binding for that word. <code>@ValidationSchema</code>,
          {' '}<code>@ApiResource</code> and <code>@HealthCheck</code> follow the same three rules.
        </Callout>

        <H3>Reuse in the UI</H3>
        <p>
          Because the ability is a value, the frontend asks the same question before rendering a
          control, so the UI never offers an action the API would reject, down to individual fields.
        </p>
        <Code file='app/pages/TaskRow.tsx' lang='tsx'>{`{ability.can('delete', task) && <button onClick={remove}>Delete</button>}
<input disabled={ability.cannot('update', task, 'title')} />`}</Code>
        <Aphorism>One rule set. It guards the route, the field, and the button. They can never disagree.</Aphorism>

        <Callout kind='future' title='Guards that follow the domain to the edge'>
          Abilities are plain evaluations with no server-bound store, so the same rules hold on Node,
          on a Worker, and in an agent call. Authorization travels with the domain.
        </Callout>

        <SeeAlso links={[
          { title: 'Auth', path: '/docs/extensions/auth' },
          { title: 'Route middleware', path: '/docs/routing/middleware' },
          { title: 'Resources', path: '/docs/extensions/resources' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
