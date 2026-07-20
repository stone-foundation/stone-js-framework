import { JSX } from 'react'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontier/security'

/**
 * Frontier: security posture.
 */
@Page(PATH, { layout: 'docs' })
export class Security implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Security posture',
      description: 'The defaults that make Stone.js apps hard to get wrong: stateless auth, validation at the edge, isomorphic rules, and a small trusted core.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontier' title='Security posture' />
        <Lead>
          Security is mostly about where trust lives and how small it is. Stone.js pushes trust to the
          boundary and keeps the core minimal, so the safe path is also the natural one. This page
          collects the posture the manual already implies.
        </Lead>

        <H2>Trust the boundary, not the depths</H2>
        <Aphorism>Validate and authenticate at the edge; let the domain assume its inputs are clean and its caller known.</Aphorism>
        <PropsTable nameHeader='Practice' rows={[
          { name: 'Validate every input', type: 'validation', desc: 'Put validate(...) on routes that accept input; the handler runs only on well-formed data.' },
          { name: 'Authenticate statelessly', type: 'auth', desc: 'Verify JWT/OAuth at the boundary; no session store to protect or leak.' },
          { name: 'Authorize isomorphically', type: 'authz', desc: 'One rule set guards the API and shapes the UI; they can never disagree.' },
          { name: 'Project your output', type: 'resources', desc: 'Return resources, not raw models, so internal fields never leak by accident.' }
        ]} />

        <H2>Secure defaults</H2>
        <ul>
          <li><strong>Cookies</strong>: set <code>httpOnly</code>, <code>secure</code> and a strict <code>sameSite</code> on anything sensitive; better still, prefer stateless tokens.</li>
          <li><strong>Secrets</strong>: read from the environment through typed getters at the edge, injected inward; never hard-code them or read <code>process.env</code> in the domain.</li>
          <li><strong>Server-only code</strong>: keep database and secret access behind server loaders so it never ships to the browser bundle.</li>
          <li><strong>Response headers</strong>: add security headers (nosniff, referrer policy, CSP) as a small response middleware, once, for every route.</li>
        </ul>

        <H2>A small trusted base</H2>
        <p>
          The micro-kernel depends on three primitives and carries no platform code; capability is
          added as packages you choose. A smaller trusted base is a smaller attack surface, and the
          agnostic core means a vulnerability in one platform's plumbing stays in that adapter, not in
          your domain.
        </p>

        <Callout kind='important' title='The edge changes the threat model, not the posture'>
          On serverless and the edge the same rules apply, and statelessness helps: no shared session
          store, no long-lived process to poison. Verify tokens per request and keep per-event state
          in the ephemeral container.
        </Callout>

        <SeeAlso links={[
          { title: 'Auth', path: '/docs/extensions/auth' },
          { title: 'Authorization', path: '/docs/extensions/authorization' },
          { title: 'Validation', path: '/docs/extensions/validation' },
          { title: 'Cookies', path: '/docs/essentials/cookies' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
