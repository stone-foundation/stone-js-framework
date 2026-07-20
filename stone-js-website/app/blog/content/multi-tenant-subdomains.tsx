import { JSX } from 'react'
import { Code } from '../../docs/components/Code'
import { Architecture } from '../components/Architecture'
import { ArticleLayout, articleHead } from '../ArticleLayout'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

const SLUG = 'multi-tenant-subdomains'

/**
 * Blog: Multi-tenancy with subdomain routing (@stone-js/router host params).
 */
@Page(`/blog/${SLUG}`, { layout: 'site' })
export class MultiTenantSubdomains implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return articleHead(SLUG)
  }

  render (): JSX.Element {
    return (
      <ArticleLayout slug={SLUG}>
        <p className='doc-lead'>
          Every SaaS reaches the same fork: <code>acme.yourapp.com</code> and
          <code> globex.yourapp.com</code> should be the same product serving different data. The common
          hack is to read the <code>Host</code> header in middleware and thread a tenant id through every
          call by hand. In Stone.js the subdomain is part of the route, so the tenant arrives already
          captured.
        </p>

        <h2>The tenant is in the host, so match on the host</h2>
        <p>
          A route can be scoped to a host, and that host can carry parameters just like a path can. A
          subdomain parameter turns multi-tenancy into routing: the router captures the tenant from the
          host and puts it on the event, next to your path and query values. No header parsing, no
          per-handler plumbing, no tenant argument passed down a call chain.
        </p>

        <Architecture
          caption='The subdomain is a route parameter. The router captures the tenant; the handler just reads it.'
          nodes={[
            { label: 'acme.example.com', sub: 'a tenant request', tone: 'client' },
            { label: 'Host match', sub: '{tenant}.example.com', tone: 'context' },
            { label: 'Handler', sub: "event.get('tenant')", tone: 'domain' },
            { label: "Tenant's data", sub: 'scoped by tenant', tone: 'store' }
          ]}
        />

        <h2>Capture the subdomain</h2>
        <p>
          Declare the parameter on the handler's <code>domain</code>, then read it on the event. It
          behaves like any other captured value, so the tenant is available everywhere the event is,
          without you doing anything to carry it.
        </p>
        <Code file='app/TenantController.ts'>{`import { EventHandler, Get } from '@stone-js/router'

@EventHandler('/', { domain: '{tenant}.example.com' })   // capture a subdomain
export class TenantController {
  @Get('/dashboard')
  dashboard (event) {
    const tenant = event.get('tenant')      // from the host, not the path
    return this.tenants.dashboard(tenant)
  }
}`}</Code>

        <h2>Constrain the host, share it across a group</h2>
        <p>
          Host parameters take constraints too, through <code>rules</code>, so you can keep a reserved
          subdomain like <code>admin</code> from ever matching the tenant pattern. And because a whole
          group can share a domain, an admin subdomain and a tenant subdomain become two groups over the
          same routes, cleanly separated at the host.
        </p>
        <Code file='app/routes.ts'>{`@Get('/', { domain: 'admin.example.com' })   // the reserved host, matched first

@EventHandler('/', {
  domain: '{tenant}.example.com',
  rules: { tenant: /[a-z0-9-]+/ }             // constrain the subdomain
})
export class TenantController { /* ... */ }`}</Code>
        <p>
          Because the reserved <code>admin.example.com</code> is a literal host and the tenant pattern is
          parameterised, the router prefers the specific one, so <code>admin</code> never resolves to a
          tenant named "admin".
        </p>

        <h2>Why it matters</h2>
        <ul>
          <li><strong>The tenant is captured once.</strong> It is a route parameter on the event, not a header you re-parse in every handler.</li>
          <li><strong>Isolation is structural.</strong> A group scoped to a host keeps admin and tenant surfaces apart at the routing layer, not by convention.</li>
          <li><strong>It is just routing.</strong> No tenancy framework to adopt, and the same handlers still run on every runtime an adapter supports.</li>
        </ul>

        <p>
          Host and subdomain matching, including how the router ranks a literal host over a parameterised
          one, is in <StoneLink to='/docs/routing/matching'> Matching and precedence</StoneLink>. Sharing
          a domain and other options across many routes is covered in
          <StoneLink to='/docs/routing/groups'> Groups and prefixes</StoneLink>.
        </p>
      </ArticleLayout>
    )
  }
}
