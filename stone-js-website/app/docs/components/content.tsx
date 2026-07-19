import { StoneLink } from '@stone-js/use-react'
import { JSX, ReactNode } from 'react'
import { DocLink } from '../nav'

/** Turns heading text into a stable slug id, so the TOC can link to it. */
export function slug (text: string): string {
  return text
    .toLowerCase()
    .replace(/[×→⟷·ψ]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Smooth-scrolls to an in-page anchor and updates the hash, bypassing any router
 * interception of hash links. The sticky-header offset is handled by the target's
 * `scroll-margin-top`.
 */
export function scrollToId (event: { preventDefault: () => void }, id: string): void {
  event.preventDefault()
  const el = document.getElementById(id)
  if (el === null) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.pushState(null, '', `#${id}`)
}

/** The title block of a doc page: a section eyebrow and the h1. */
export function ArticleTop ({ eyebrow, title }: { eyebrow: string, title: string }): JSX.Element {
  return (
    <header className='doc-top'>
      <p className='doc-eyebrow'>{eyebrow}</p>
      <h1 className='doc-h1'>{title}</h1>
    </header>
  )
}

/** The opening paragraph of a page, set larger. */
export function Lead ({ children }: { children: ReactNode }): JSX.Element {
  return <p className='doc-lead'>{children}</p>
}

/** A section heading that carries an anchor id (consumed by the TOC). */
export function H2 ({ children }: { children: string }): JSX.Element {
  const id = slug(children)
  return <h2 id={id} className='doc-h2'><a className='anchor' href={`#${id}`} aria-label={children} onClick={(e) => scrollToId(e, id)}>#</a>{children}</h2>
}

/** A sub-heading that carries an anchor id. */
export function H3 ({ children }: { children: string }): JSX.Element {
  const id = slug(children)
  return <h3 id={id} className='doc-h3'><a className='anchor' href={`#${id}`} aria-label={children} onClick={(e) => scrollToId(e, id)}>#</a>{children}</h3>
}

type CalloutKind = 'note' | 'important' | 'future'
const CALLOUT_LABEL: Record<CalloutKind, string> = { note: 'Note', important: 'Important', future: 'From the frontier' }

/**
 * An aside. `future` is the signature "bring the future to them" callout: use it
 * to name a concept the reader has probably never seen elsewhere.
 */
export function Callout ({ kind = 'note', title, children }: { kind?: CalloutKind, title?: string, children: ReactNode }): JSX.Element {
  return (
    <aside className={`callout callout-${kind}`}>
      <p className='callout-label'>{title ?? CALLOUT_LABEL[kind]}</p>
      <div className='callout-body'>{children}</div>
    </aside>
  )
}

/**
 * The central teaching device. Every Foundations concept is taught twice:
 * first as a framework-agnostic architectural truth (the principle), then as
 * its Stone.js incarnation. The reader leaves a better architect either way.
 */
export function Principle ({ principle, incarnation }: { principle: ReactNode, incarnation: ReactNode }): JSX.Element {
  return (
    <div className='principle'>
      <div className='pr-side pr-principle'>
        <p className='pr-tag'>The principle</p>
        <div className='pr-body'>{principle}</div>
      </div>
      <div className='pr-side pr-incarnation'>
        <p className='pr-tag'>In Stone.js</p>
        <div className='pr-body'>{incarnation}</div>
      </div>
    </div>
  )
}

/** A pull-quote, for a line worth stopping on. */
export function Aphorism ({ children, cite }: { children: ReactNode, cite?: string }): JSX.Element {
  return (
    <figure className='aphorism'>
      <blockquote>{children}</blockquote>
      {cite !== undefined && <figcaption>{cite}</figcaption>}
    </figure>
  )
}

/**
 * An options / API reference table. Keeps every reference page's tables uniform:
 * a name, a type, an optional default, and a description.
 */
export interface PropRow { name: string, type: string, default?: string, required?: boolean, desc: ReactNode }

export function PropsTable ({ rows, nameHeader = 'Option' }: { rows: PropRow[], nameHeader?: string }): JSX.Element {
  const showDefault = rows.some((r) => r.default !== undefined)
  return (
    <div className='table-wrap'>
      <table>
        <thead>
          <tr>
            <th>{nameHeader}</th>
            <th>Type</th>
            {showDefault && <th>Default</th>}
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>{r.name}{r.required === true && <span className='req' title='Required'>*</span>}</td>
              <td><code>{r.type}</code></td>
              {showDefault && <td>{r.default !== undefined ? <code>{r.default}</code> : <span className='muted'>·</span>}</td>}
              <td>{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** A short list of related pages, shown before the pager. */
export function SeeAlso ({ links }: { links: Array<{ title: string, path: string }> }): JSX.Element {
  return (
    <aside className='see-also'>
      <p className='see-also-title'>See also</p>
      <ul>
        {links.map((l) => (
          <li key={l.path}><StoneLink to={l.path}>{l.title}</StoneLink></li>
        ))}
      </ul>
    </aside>
  )
}

/** The prev/next pager, driven by the doc spine. */
export function Pager ({ prev, next }: { prev?: DocLink, next?: DocLink }): JSX.Element {
  return (
    <nav className='pager' aria-label='Page navigation'>
      {prev !== undefined
        ? <StoneLink className='pager-link prev' to={prev.path}><span className='dir'>← Previous</span><span className='ttl'>{prev.title}</span></StoneLink>
        : <span />}
      {next !== undefined
        ? <StoneLink className='pager-link next' to={next.path}><span className='dir'>Next →</span><span className='ttl'>{next.title}</span></StoneLink>
        : <span />}
    </nav>
  )
}
