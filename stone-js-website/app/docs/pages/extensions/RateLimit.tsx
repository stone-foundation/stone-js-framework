import { JSX } from 'react'
import { siblings } from '../../nav'
import { Code, CodeTabs } from '../../components/Code'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager, Aphorism } from '../../components/content'

const PATH = '/docs/extensions/rate-limit'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { RateLimit } from '@stone-js/rate-limit'

@RateLimit()
@StoneApp({ name: 'app' })
export class Application {}
`

const IMP = `
import { defineConfig, defineStoneApp } from '@stone-js/core'
import { rateLimitBlueprint } from '@stone-js/rate-limit'

// Enable the module on the manifest, exactly where the decorator sits
export const App = defineStoneApp({ name: 'app' }, [rateLimitBlueprint])

// Then configure it
export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.rateLimit', {
  default: 'shared',
  limiters: [{ name: 'shared', driver: 'redis', url: 'redis://localhost:6379' }],
  trustedAddressHeaders: ['cloudfront-viewer-address']
}))
`

const ROUTE_DECL = `
import { Post } from '@stone-js/router'

export class AuthController {
  @Post('/auth/code', { rateLimit: { max: 3, window: 900, by: 'email' } })
  sendCode (event: IncomingHttpEvent) { /* ... */ }
}
`

const ROUTE_IMP = `
import { defineEventHandler, definePost } from '@stone-js/router'

export const AuthController = defineEventHandler({}, {
  sendCode: definePost('/auth/code', { rateLimit: { max: 3, window: 900, by: 'email' } })
})
`

const CUSTOM_LIMITER = `
blueprint.set('stone.rateLimit', {
  default: 'table',
  limiters: [{
    name: 'table',
    factory: () => ({
      hit: async (key, limit, windowMs) => await countInMyTable(key, limit, windowMs)
    })
  }]
})
`

/**
 * Extensions: Rate limit.
 */
@Page(PATH, { layout: 'docs' })
export class RateLimitPage implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Rate limit',
      description: 'Declare a budget where you declare the route: subject-first throttling, enforced before auth and validation, counted per process or shared through Redis.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Rate limit' />
        <Lead>
          A budget declared where the route is declared, enforced before authentication, authorization
          and validation, and counted by a limiter you choose: per process by default, shared through
          Redis, or a driver of your own for the store your deployment already runs on.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/rate-limit
npm i ioredis   # only for the shared Redis limiter`}</Code>

        <H2>Enable it</H2>
        <Principle
          principle={
            <p>
              A limit is part of what an endpoint promises, so it belongs next to the endpoint, in the
              same declaration as its path and its guard.
            </p>
          }
          incarnation={
            <p>
              Enabling the module puts the enforcement in place and limits nothing. A route says
              <code> rateLimit</code>, and that route is throttled: no separate registry to keep in
              step with the routes it protects.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H2>Declare a budget</H2>
        <p>
          On a route, which is the usual place. Three requests per subject per fifteen minutes, keyed
          on the mailbox the code would be sent to:
        </p>
        <CodeTabs file='app/AuthController.ts' decl={ROUTE_DECL} imp={ROUTE_IMP} />

        <H3>On a group</H3>
        <p>
          A budget on a group holds for every route under it, alongside each route's own. Both promises
          are kept, counted separately, and enforced group-first.
        </p>
        <Code file='app/ApiHandler.ts'>{`@EventHandler('/api', { rateLimit: { max: 100, window: 60, by: 'address', scope: 'api' } })
export class ApiHandler {
  @Get('/notes', { rateLimit: { max: 20, window: 60, by: 'address' } })
  notes (event: IncomingHttpEvent) { /* ... */ }
}`}</Code>
        <Callout kind='important' title='Why the group names a scope'>
          <p>
            A rule declared on a group is copied onto each child, and at enforcement time nothing
            records which ancestor a rule came from. Unscoped, that group's <code>max: 100</code> is a
            hundred <em>per child route</em>. Naming a <code>scope</code> makes it the shared ceiling it
            looks like, and lets unrelated routes share one budget too.
          </p>
        </Callout>

        <H3>Without a router</H3>
        <p>
          A command, a queue consumer or a single-handler application has no route to declare on.
          <code> @Throttle</code> declares the budget on the handler method itself, and the global rule
          covers everything that declares nothing.
        </p>
        <Code file='app/AuthController.ts'>{`import { Throttle } from '@stone-js/rate-limit'

class AuthController {
  @Throttle({ max: 3, window: 900, by: 'email' })
  sendCode (event: IncomingEvent) { /* ... */ }
}`}</Code>

        <H2>What a rule says</H2>
        <PropsTable rows={[
          { name: 'max', type: 'number', required: true, desc: 'How many requests the window allows.' },
          { name: 'window', type: 'number', required: true, desc: 'How long the window lasts, in seconds.' },
          {
            name: 'by',
            type: 'string | function',
            required: true,
            desc: <>What the budget belongs to: a request field (<code>'email'</code>), alternatives (<code>'phone|email'</code>, first present wins), <code>'user'</code> for the authenticated principal, <code>'address'</code>, or a function <code>(event) =&gt; string | undefined</code>.</>
          },
          {
            name: 'backstop',
            type: 'number | false',
            default: '10',
            desc: <>The per-address bucket that runs alongside a subject budget, as a multiple of <code>max</code>. <code>false</code> runs the subject budget alone.</>
          },
          {
            name: 'scope',
            type: 'string',
            desc: 'A bucket shared with every rule naming it, instead of one per route. How a ceiling spanning several routes is expressed.'
          },
          { name: 'limiter', type: 'string', desc: 'Which configured limiter counts this rule. Defaults to the application default.' }
        ]} />

        <Callout kind='important' title='`by` has no default, on purpose'>
          <p>
            The only default it could have is <code>'address'</code>, and that is the single thing this
            module argues against. A rule that omitted the word therefore meant the opposite of what
            is recommended here, and nothing in a review showed it: whoever wants the address writes
            it, and it becomes a decision on the page.
          </p>
        </Callout>

        <H2>Throttle the subject, not the address</H2>
        <Aphorism>
          A per-address quota assumes one address is one person, and refuses hardest exactly where the
          audience is largest.
        </Aphorism>
        <p>
          On mobile networks using carrier-grade NAT, the norm across much of the world, hundreds of
          unrelated subscribers share one public address. So the budget belongs to the thing actually
          being protected: the account, the mailbox, the phone number. The address keeps a much looser
          bucket, the <code>backstop</code>, whose only job is to stop one machine enumerating subjects
          in bulk.
        </p>
        <p>
          A request that carries no subject is billed to that looser bucket rather than the strict one,
          so a malformed request cannot spend an account's budget, and omitting a field is not a way to
          buy an unlimited one.
        </p>
        <H3>Where the subject lives</H3>
        <p>
          A field name covers the common cases: it is read from the route parameters, then the body,
          then the query. Anything else is a function, which is the honest answer, because an
          application knows where its subject lives and this module would only be guessing.
        </p>
        <Code file='app/AuthController.ts'>{`@Post('/auth/code', {
  rateLimit: { max: 3, window: 900, by: (event) => event.getHeader('x-account') }
})`}</Code>
        <p>
          A subject read never breaks the route. Whatever fails, a resolver that throws included, the
          request falls back to the address bucket at the backstop and a warning names the rule that
          was downgraded.
        </p>

        <H3><code>by: 'user'</code> runs before authentication</H3>
        <p>
          Enforcement sits ahead of authentication deliberately, so at that point nothing has resolved
          a principal yet unless the application resolved one earlier. Say where yours lives, and the
          ordering stops mattering.
        </p>
        <Code file='app/AppConfig.ts'>{`blueprint.set('stone.rateLimit.principal', (event) => event.getUser()?.userId)`}</Code>
        <p>
          The default reads <code>event.getUser?.()</code> and takes its <code>id</code>,
          <code> sub</code> or <code>userId</code>. With nothing to bill, the rule falls back to the
          address at the backstop, ten times the limit, and warns: correct as a behaviour, unacceptable
          as a silence, since a budget of three would otherwise allow thirty with every test green.
        </p>

        <Callout kind='note' title='Keys carry no identities'>
          Subjects are hashed before they are used as keys, and a refusal is logged without the subject,
          the address or the body. A key is read by whoever debugs the store, and a mailbox has no
          business being there.
        </Callout>

        <H2>Limiters</H2>
        <PropsTable nameHeader='limiter' rows={[
          { name: 'memory', type: 'built-in', desc: 'Per-process fixed window. Zero-config and always available. Across several instances it is not a limit, since each one grants the whole budget again.' },
          { name: 'redis', type: 'ioredis', desc: 'Shared across instances. One round trip per request and no read: the window index is part of the key, so a new window is a new key starting at zero and the counter expires on its own.' },
          { name: 'your own', type: 'contract', desc: 'Register a limiter for the store your deployment already runs on.' }
        ]} />
        <p>
          A limiter receives the limit rather than holding it, so an implementation that can refuse
          atomically through a conditional write has what it needs to express the condition, and pays
          nothing for a refusal. Declare it with the other limiters, through a <code>factory</code>.
        </p>
        <Code file='app/AppConfig.ts'>{CUSTOM_LIMITER.trim()}</Code>
        <Callout kind='note' title='Why config and not a provider'>
          The container is an execution context, rebuilt for every event. A limiter registered
          imperatively during one event is gone for the next, and an application should not have to
          know that to plug in a driver. Declared here, it is simply always there.
        </Callout>

        <H2>What a caller is told</H2>
        <p>
          A refusal answers <code>429</code> with <code>Retry-After</code>. The error carries its own
          status, so an HTTP platform answers <code>429</code> while a CLI or a queue consumer reads
          <code> RateLimitError</code> directly: nothing in this module knows which platform is
          answering. It carries the stable code <code>RATE_LIMIT_EXCEEDED</code>, so an application
          maps it to its own error envelope without importing this package into its error handler.
        </p>
        <p>
          Within budget, the response carries <code>RateLimit-Limit</code>,
          <code> RateLimit-Remaining</code> and <code>RateLimit-Reset</code>, reporting the budget
          closest to being exceeded. Set <code>stone.rateLimit.headers</code> to <code>false</code> to
          publish nothing.
        </p>

        <H2>Behind a proxy</H2>
        <Callout kind='important' title='No forwarded header is trusted by default'>
          <p>
            A forwarded header is client-spoofable unless an edge you trust overwrites it, so reading
            one by default would hand every caller an unlimited supply of identities. Name the header
            your own edge guarantees through <code>trustedAddressHeaders</code>, in order of preference.
          </p>
        </Callout>
        <Code file='app/AppConfig.ts'>{`blueprint.set('stone.rateLimit.trustedAddressHeaders', ['cloudfront-viewer-address'])`}</Code>
        <p>
          Whatever the address comes from, the port is stripped before it becomes a key. A port is
          per connection, so leaving it in gives each connection its own budget: a limiter that fires
          only on the callers well-behaved enough to reuse a keep-alive connection.
        </p>

        <H2>Where it runs</H2>
        <p>
          On the router layer, outside every other route middleware: authentication is next, then
          authorization and resources, then validation. Rejecting a caller past its budget is worth
          nothing once the database has been read and the mail provider called.
        </p>

        <SeeAlso links={[
          { title: 'Route middleware', path: '/docs/routing/middleware' },
          { title: 'Authorization', path: '/docs/extensions/authorization' },
          { title: 'Cache', path: '/docs/extensions/cache' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
