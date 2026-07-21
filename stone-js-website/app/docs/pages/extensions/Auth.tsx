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

        <H2>Configure the signing strategy</H2>
        <p>
          Auth is enabled from a <code>@Configuration()</code> that merges the auth blueprint (its
          service provider and the kernel middleware that verifies the Bearer token) and sets how
          tokens are signed and verified. Use a shared HMAC <code>secret</code> for symmetric JWT, or a
          <code> publicKey</code>/<code>jwksUri</code> to verify tokens minted by an external identity
          provider. Read secrets from the environment, never hard-code them.
        </p>
        <Code file='app/configurations/AuthConfiguration.ts'>{`import { getString } from '@stone-js/env'
import { authBlueprint } from '@stone-js/auth'
import { Configuration, IBlueprint, IConfiguration } from '@stone-js/core'

@Configuration()
export class AuthConfiguration implements IConfiguration {
  configure (blueprint: IBlueprint): void {
    blueprint
      .set(authBlueprint)                                    // provider + verify middleware
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
  const user = event.get('user')          // the authenticated principal
  return this.tasks.ownedBy(user.id)
}`}</Code>

        <H3>Custom strategies</H3>
        <p>
          The built-in verification covers JWT and OAuth. When you need something else, an API key, a
          session, a bespoke provider, implement an <code>Authenticator</code>: it turns a request into
          a principal (or rejects it), and the same <code>requireAuth</code>/<code>requireScopes</code>
          guards work on top of it unchanged.
        </p>
        <Code file='app/ApiKeyAuthenticator.ts'>{`import { Authenticator } from '@stone-js/auth'

export class ApiKeyAuthenticator extends Authenticator {
  async authenticate (event: IncomingHttpEvent) {
    const key = event.getHeader('x-api-key')
    const user = await this.keys.resolve(key)
    if (user === undefined) throw new AuthenticationError('Invalid API key')  // -> 401
    return user                                    // becomes event.get('user')
  }
}`}</Code>

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
