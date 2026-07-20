import { JSX } from 'react'
import { siblings } from '../../nav'
import { slug } from '../../components/content'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Pager } from '../../components/content'

const PATH = '/docs/reference/glossary'

interface Term { term: string, dim?: string, def: string }

const TERMS: Term[] = [
  { term: 'Continuum', def: 'The architecture Stone.js implements: an application is an act, Domain times Context resolving into a Resolution.' },
  { term: 'Domain', dim: 'Functional', def: 'What your software means: its rules, entities and use cases. Written once, portable across every context.' },
  { term: 'Context', dim: 'Integration', def: 'Everything the domain does not control: runtime, protocol, input and output shapes. Supplied by the framework.' },
  { term: 'Resolution', def: 'The concrete response produced when a domain is applied to a context, once per event.' },
  { term: 'Blueprint', dim: 'Setup', def: 'The single configuration manifest, addressed by dotted stone.* keys, built once before any event runs.' },
  { term: 'Adapter', dim: 'Integration', def: 'The translator at the boundary: it turns a raw platform cause into an intention, and a resolution back into a native effect. One per platform; stackable.' },
  { term: 'Kernel', dim: 'Initialization', def: 'The core that applies the domain to an intention, with a fresh container per event. Knows nothing of any platform.' },
  { term: 'IncomingEvent', def: 'The normalised intention a handler reads. Transport-agnostic: it never reveals whether it came from HTTP, CLI, the browser or an agent.' },
  { term: 'Intention', def: 'The clean, normalised form of a raw cause that a handler acts on, carried by the IncomingEvent. The domain works with intentions, never with platform objects.' },
  { term: 'Dimension', def: 'One of the four stages of the act: Setup (Blueprint), Integration (adapter), Initialization (kernel), Functional (your domain).' },
  { term: 'Ephemeral context', def: 'The per-event container: created for one intention, discarded after. Only the adapter is long-lived.' },
  { term: 'Superposition', def: 'Several contexts stacked on one domain, none yet selected. Adapters coexist until a cause arrives.' },
  { term: 'Collapse', def: 'The run-time selection of one context for one event, performed when the app runs (StoneFactory.run resolves the adapter), never at build or deploy.' },
  { term: 'Decoherence', def: 'The confinement of the platform-specific translation to the adapter, so the messy passage from raw cause to clean intention never propagates inward.' },
  { term: 'Meta-module', def: 'The imperative unit produced by a define* helper: { module, isClass?, isFactory? }, registered onto the Blueprint.' },
  { term: 'The three forms', def: 'Class, factory and function: the three shapes a module can take. The function form never receives the container; providers forbid it.' },
  { term: 'Middleware', def: 'A step in the pipeline an event flows through on its way to a handler; where validation, auth and authorization attach.' },
  { term: 'Service provider', def: 'A unit that registers services into the container during initialization.' }
]

/**
 * Reference: the Continuum vocabulary.
 */
@Page(PATH, { layout: 'docs' })
export class Glossary implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Glossary',
      description: 'The Continuum vocabulary: the precise meaning of every term the documentation uses.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Reference' title='Glossary' />
        <Lead>
          The words here carry precise meanings across the whole documentation. When a term feels
          overloaded elsewhere, this is what it means in Stone.js.
        </Lead>

        <H2>The Continuum vocabulary</H2>
        <dl className='deflist'>
          {TERMS.map((t) => (
            <div key={t.term}>
              <dt id={slug(t.term)}>{t.term}{t.dim !== undefined && <span className='term-tag'>{t.dim} dimension</span>}</dt>
              <dd>{t.def}</dd>
            </div>
          ))}
        </dl>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
