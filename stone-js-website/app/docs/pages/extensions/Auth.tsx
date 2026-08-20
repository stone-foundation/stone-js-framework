import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/auth'

const DECL = `
import { EventHandler, Get, Post } from '@stone-js/router'
import { requireAuth, requireScopes } from '@stone-js/auth'

@EventHandler('/tasks')
export class TaskController {
  @Get('/', { middleware: [requireAuth()] })              // must be authenticated
  list () { return this.tasks.list() }

  @Post('/', { middleware: [requireScopes('tasks:write')] })  // must hold the scope
  create (event) { return this.tasks.add(event.get('title')) }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'
import { requireAuth, requireScopes } from '@stone-js/auth'

export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'list'),
    { path: '/tasks', method: 'GET', middleware: [requireAuth()] }],
  [defineEventHandler(TaskController, 'create'),
    { path: '/tasks', method: 'POST', middleware: [requireScopes('tasks:write')] }]
])
`

/**
 * Extensions: authentication.
 */
@Page(PATH, { layout: 'docs' })
export class Auth implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Auth',
      description: 'Stateless authentication on JWT and OAuth, edge-native with no session store. Guard routes with requireAuth and requireScopes.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Auth' />
        <Lead>
          Authentication asks one question: who is calling. <code>@stone-js/auth</code> answers it
          statelessly, verifying a JWT or OAuth token at the boundary, so there is no session store to
          run and the same guard works on Node, on the edge, and in an agent call.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/auth`}</Code>

        <H2>Enabling it</H2>
        <p>
          Auth is enabled the way every Stone.js module is, with its decorator or with its blueprint.
          Either one registers the service provider and the kernel middleware that verifies the Bearer
          token carried by each request.
        </p>
        <CodeTabs
          file='app/Application.ts'
          decl={`import { Auth } from '@stone-js/auth'
import { StoneApp } from '@stone-js/core'

@Auth()
@StoneApp({ name: 'my-app' })
export class Application {}`}
          imp={`import { defineStoneApp } from '@stone-js/core'
import { authBlueprint } from '@stone-js/auth'

export const Application = defineStoneApp({ name: 'my-app' }, [authBlueprint])`}
        />

        <H2>Configure the signing strategy</H2>
        <p>
          Nothing is verified until you say how tokens are signed. Use a shared HMAC{' '}
          <code>secret</code> for symmetric JWT, or a <code>publicKey</code>/<code>jwksUri</code> to
          verify tokens minted by an external identity provider. Read secrets from the environment,
          never hard-code them.
        </p>
        <Code file='app/configurations/AuthConfiguration.ts'>{`import { getString } from '@stone-js/env'
import { Configuration, IBlueprint, IConfiguration } from '@stone-js/core'

@Configuration()
export class AuthConfiguration implements IConfiguration {
  configure (blueprint: IBlueprint): void {
    blueprint
      .set('stone.auth.secret', getString('JWT_SECRET'))     // HMAC (HS256); or publicKey / jwksUri
      .set('stone.auth.issuer', 'https://your-issuer.example')
      .set('stone.auth.audience', 'your-api')
      .set('stone.auth.ttl', '1h')
  }
}`}</Code>
        <Callout kind='important' title='Provide exactly one verification strategy'>
          A shared <code>secret</code> (HMAC), an asymmetric <code>publicKey</code> (RS/ES), and/or a
          remote <code>jwksUri</code>. For third-party OAuth/OIDC, point <code>jwksUri</code> at the
          provider's JWKS endpoint and set <code>issuer</code>/<code>audience</code> to match the
          tokens you accept.
        </Callout>

        <H2>Identity at the boundary</H2>
        <Principle
          principle={
            <p>
              Identity should be established once, at the edge, and carried as context, not re-derived
              deep in the code. Server-held state ties you to one machine; a token verified at the
              boundary travels wherever the request does.
            </p>
          }
          incarnation={
            <p>
              Guards are middleware. <code>requireAuth()</code> rejects anonymous calls with a
              <code> 401</code>; <code>requireScopes(...)</code> additionally demands OAuth scopes,
              rejecting a missing one with a <code>403</code>. The verified principal is then available
              on the event.
            </p>
          }
        />
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />

        <H2>Guards</H2>
        <PropsTable nameHeader='Guard' rows={[
          { name: 'requireAuth()', type: '() => middleware', desc: 'Require a valid token; 401 when anonymous.' },
          { name: 'requireScopes(...scopes)', type: '(...string) => middleware', desc: 'Require every listed OAuth scope; 401 when anonymous, 403 when a scope is missing.' }
        ]} />

        <H3>Reading the principal</H3>
        <Code file='app/Tasks.ts'>{`@Get('/mine', { middleware: [requireAuth()] })
mine (event: IncomingHttpEvent) {
  const user = event.getUser()           // the authenticated principal
  return this.tasks.ownedBy(user.id)
}`}</Code>

        <H3>Turning a token into your own principal</H3>
        <p>
          Verification produces claims. Which <em>user</em> those claims mean is your application's
          question, so <code>resolveUser</code> answers it: it receives the verified claims and returns
          whatever your code should see, and the same <code>requireAuth</code> /
          {' '}<code>requireScopes</code> guards work on top of it unchanged.
        </p>
        <Code file='app/Application.ts'>{`@Auth({
  resolveUser: async (claims) => await users.findById(claims.sub)   // awaited: a store lookup
})
export class Application {}`}</Code>
        <p>
          The principal is then read with <code>event.getUser()</code>. Not
          {' '}<code>event.get('user')</code>: it travels through a resolver rather than as metadata, so
          the generic accessor does not reach it.
        </p>
        <Code file='app/TasksController.ts'>{`const user = event.getUser<User>()   // the authenticated principal, or undefined`}</Code>

        <Callout kind='note' title='Stateless by design'>
          Nothing here touches a session table. The token is verified on each request, which is what
          lets auth run unchanged on serverless and edge runtimes. Configure issuers and keys through
          the auth blueprint / environment.
        </Callout>

        <SeeAlso links={[
          { title: 'Authorization', path: '/docs/extensions/authorization' },
          { title: 'Route middleware', path: '/docs/routing/middleware' },
          { title: 'Cookies', path: '/docs/essentials/cookies' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
