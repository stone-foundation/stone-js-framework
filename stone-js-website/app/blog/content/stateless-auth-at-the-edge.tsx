import { JSX } from 'react'
import { Code } from '../../docs/components/Code'
import { Diagram } from '../components/Diagram'
import { ArticleLayout, articleHead } from '../ArticleLayout'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

const SLUG = 'stateless-auth-at-the-edge'

/**
 * Blog: Stateless auth at the edge (@stone-js/auth recipe).
 */
@Page(`/blog/${SLUG}`, { layout: 'site' })
export class StatelessAuthAtTheEdge implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return articleHead(SLUG)
  }

  render (): JSX.Element {
    return (
      <ArticleLayout slug={SLUG}>
        <p className='doc-lead'>
          Authentication asks one question: who is calling. Answer it with a server-held session and
          you have tied your app to one machine. Answer it by verifying a token at the boundary and the
          same guard works on Node, on serverless, on the edge, and in an agent call.
        </p>

        <h2>Why sessions break at the edge</h2>
        <p>
          A session store is shared mutable state: a table, a Redis, a sticky server. It assumes a
          long-lived process with somewhere to keep the session and a way to find it again. Serverless
          functions are ephemeral and edge runtimes are distributed across the planet, so that
          assumption is exactly the one that does not hold where modern apps want to run.
        </p>

        <h2>Verify at the boundary, carry identity as context</h2>
        <p>
          Stateless auth flips it: the client presents a token (JWT or OAuth) on every request, the
          boundary verifies it, and the verified principal travels with the event. There is nothing to
          store and nothing to look up, so the same code runs anywhere a request can arrive.
        </p>

        <Diagram
          caption='The token is verified once, at the boundary; the principal rides the event inward. No session store, so the same guard runs on Node, the edge and agents.'
          nodes={[
            { label: 'Client', sub: 'Bearer token', kind: 'client' },
            { label: 'Boundary', sub: 'verify JWT / OAuth', kind: 'context' },
            { label: 'Handler', sub: "event.get('user')", kind: 'domain' },
            { label: 'Response', sub: 'no session touched', kind: 'store' }
          ]}
        />

        <h2>Guards are middleware</h2>
        <p>
          <code>@stone-js/auth</code> exposes guards as route middleware. <code>requireAuth()</code>
          rejects anonymous calls with a <code>401</code>; <code>requireScopes(...)</code> additionally
          demands OAuth scopes, rejecting a missing one with a <code>403</code>. The verified principal
          is then on the event.
        </p>
        <Code file='app/TaskController.ts'>{`import { EventHandler, Get, Post } from '@stone-js/router'
import { requireAuth, requireScopes } from '@stone-js/auth'

@EventHandler('/tasks')
export class TaskController {
  @Get('/', { middleware: [requireAuth()] })              // must be authenticated
  list () { return this.tasks.list() }

  @Post('/', { middleware: [requireScopes('tasks:write')] })  // must hold the scope
  create (event) { return this.tasks.add(event.get('title')) }

  @Get('/mine', { middleware: [requireAuth()] })
  mine (event) {
    const user = event.get('user')          // the verified principal
    return this.tasks.ownedBy(user.id)
  }
}`}</Code>

        <h2>Bring your own strategy</h2>
        <p>
          JWT and OAuth are built in. When you need something else, an API key, a bespoke provider,
          implement an <code>Authenticator</code>: it turns a request into a principal (or rejects it),
          and the same <code>requireAuth</code>/<code>requireScopes</code> guards work on top unchanged.
        </p>
        <Code file='app/ApiKeyAuthenticator.ts'>{`import { Authenticator, AuthenticationError } from '@stone-js/auth'

export class ApiKeyAuthenticator extends Authenticator {
  async authenticate (event) {
    const key = event.getHeader('x-api-key')
    const user = await this.keys.resolve(key)
    if (user === undefined) throw new AuthenticationError('Invalid API key')  // -> 401
    return user                                    // becomes event.get('user')
  }
}`}</Code>

        <h2>Why it matters</h2>
        <ul>
          <li><strong>Runs everywhere.</strong> No session store means the same guard works on Node, serverless, the edge and agents, unchanged.</li>
          <li><strong>Nothing to operate.</strong> No session table, no sticky sessions, no cache to scale.</li>
          <li><strong>One guard, every context.</strong> The same <code>requireAuth()</code> protects an HTTP route, a CLI command and an agent tool call.</li>
        </ul>

        <p>
          Configure issuers and keys through the auth blueprint or the environment. The full API is in
          <StoneLink to='/docs/extensions/auth'> Auth</StoneLink>, and pairs with
          <StoneLink to='/docs/extensions/authorization'> Authorization</StoneLink> (CASL: RBAC + ABAC)
          when you need to decide not just who, but what they may do.
        </p>
      </ArticleLayout>
    )
  }
}
