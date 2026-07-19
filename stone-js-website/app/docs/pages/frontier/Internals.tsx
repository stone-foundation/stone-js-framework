import { JSX } from 'react'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontier/internals'

/**
 * Frontier: internals.
 */
@Page(PATH, { layout: 'docs' })
export class Internals implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Internals',
      description: 'How the pieces fit at runtime: from a raw cause to a response, through the adapter, the build phase, the kernel and the container.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontier' title='Internals' />
        <Lead>
          You can use Stone.js without any of this, but seeing how a request actually flows makes the
          rest obvious. There are two timelines: setup, which runs once, and the per-event path, which
          runs for every cause. Both are pipelines over the same three primitives.
        </Lead>

        <H2>Setup, once</H2>
        <p>
          At startup the CLI has already discovered your modules and their metadata. The
          <code> BlueprintBuilder</code> runs a pipeline of blueprint middleware that reads that
          metadata (and your <code>define*</code> modules) and composes the Blueprint. It is then
          frozen. The long-lived adapter is created and starts listening.
        </p>
        <Aphorism>Setup is a pipeline over the manifest. It runs once, and freezes.</Aphorism>

        <H2>Per event</H2>
        <PropsTable nameHeader='Step' rows={[
          { name: '1. Capture', type: 'adapter', desc: 'The adapter receives the platform’s raw cause.' },
          { name: '2. Normalise', type: 'adapter', desc: 'It builds an IncomingEvent, the intention.' },
          { name: '3. Scope', type: 'kernel', desc: 'The kernel creates a fresh container and resolves handlers/services into it.' },
          { name: '4. Pipeline', type: 'kernel', desc: 'The event flows through the middleware pipeline to the resolved handler.' },
          { name: '5. Handle', type: 'domain', desc: 'Your handler runs and returns a value (or throws).' },
          { name: '6. Resolve', type: 'kernel', desc: 'The result (or a mapped error) becomes a response.' },
          { name: '7. Emit', type: 'adapter', desc: 'The adapter turns the response into a native effect; the container is discarded.' }
        ]} />

        <H2>Where the primitives show through</H2>
        <ul>
          <li><strong>Pipeline</strong>: both the build phase (step over the manifest) and the middleware chain (step over the event).</li>
          <li><strong>Container</strong>: the per-event scope created at step 3 and discarded at step 7.</li>
          <li><strong>Config</strong>: the frozen Blueprint every step reads.</li>
        </ul>

        <H2>Resolution details</H2>
        <p>
          Handlers and services are resolved by alias, not by type reflection, because Stone.js uses
          TC39 metadata, not reflect-metadata. A constructor receives one object of resolved bindings
          and destructures the names it wants. Singletons are cached in the current container, so they
          live for one event.
        </p>

        <Callout kind='future' title='Two timelines, one idea'>
          Setup and the per-event path look different but are the same shape: a value sent through
          ordered steps. Once you see the pipeline in both, the framework has no more secrets, only
          compositions of three small primitives.
        </Callout>

        <SeeAlso links={[
          { title: 'Primitives', path: '/docs/primitives' },
          { title: 'Lifecycle & the kernel', path: '/docs/foundations/lifecycle' },
          { title: 'The build & targets', path: '/docs/blueprint/build' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
