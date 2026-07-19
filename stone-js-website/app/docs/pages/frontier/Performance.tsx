import { JSX } from 'react'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontier/performance'

/**
 * Frontier: performance & cold starts.
 */
@Page(PATH, { layout: 'docs' })
export class Performance implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Performance & cold starts',
      description: 'Why the architecture is fast by default, and the handful of choices that keep it fast on serverless and the edge.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontier' title='Performance & cold starts' />
        <Lead>
          Performance in Stone.js is mostly structural: the model that keeps your domain portable also
          keeps it fast. A few deliberate choices, especially around cold starts, are all that is left
          to you.
        </Lead>

        <H2>Fast by construction</H2>
        <Aphorism>The Blueprint is built once; each event just runs. Setup cost does not repeat per request.</Aphorism>
        <PropsTable nameHeader='Property' rows={[
          { name: 'One-time build phase', type: 'startup', desc: 'The manifest is assembled once, not per request; handling an event has no setup tax.' },
          { name: 'Ephemeral container', type: 'per event', desc: 'A fresh, minimal scope per event; nothing long-lived to scan or grow.' },
          { name: 'Agnostic core', type: 'always', desc: 'No platform shims on the hot path; the adapter does the platform work once, at the edge.' },
          { name: 'Sync pipeline path', type: 'hot paths', desc: 'Chains with no async pipe can run synchronously, saving a microtask per step.' }
        ]} />

        <H2>Cold starts</H2>
        <p>
          On serverless and the edge, the cost that matters is the first request after a cold start.
          The model already minimises it, only the adapter is long-lived, but you can help:
        </p>
        <ul>
          <li><strong>Keep the bundle lean</strong>: fewer, smaller dependencies load faster. Import server-only code behind server loaders so it never enters the client bundle.</li>
          <li><strong>Defer heavy work</strong>: open pools and prime caches in an <code>onStart</code> hook, lazily where possible, not at module top-level.</li>
          <li><strong>Prefer the fetch adapter on the edge</strong>: the Web-standard path is the lightest on isolate-based runtimes.</li>
          <li><strong>Choose SSG where you can</strong>: a pre-rendered page has no server cold start at all; hydrate for interactivity.</li>
        </ul>

        <H2>Measure, do not guess</H2>
        <p>
          Enable telemetry and watch the spans around real events before optimising. The per-event span
          tells you where time actually goes; a few meaningful measurements beat intuition, especially
          across contexts where the cost profile differs.
        </p>

        <Callout kind='note' title='Portability is not a tax'>
          Because the domain never carries platform shims, moving it to a faster runtime is a
          deployment change, not a rewrite. The cheapest optimisation is often choosing the right
          context, which the architecture lets you do late.
        </Callout>

        <SeeAlso links={[
          { title: 'The ephemeral context', path: '/docs/foundations/ephemeral-context' },
          { title: 'Telemetry', path: '/docs/extensions/telemetry' },
          { title: 'Rendering: CSR, SSR, SSG', path: '/docs/frontend/rendering' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
