import { JSX } from 'react'

/** One node in an architecture flow. */
export interface ArchNode {
  label: string
  sub?: string
  /** Visual role: tints the node. */
  tone?: 'client' | 'domain' | 'context' | 'store' | 'external'
}

/**
 * A bespoke, brand-aligned architecture diagram: a sequence of labelled nodes
 * connected by braise arrows. Renders at build time (pure React → static SVG-free
 * markup), so it is SSG and SEO friendly, theme-aware, and needs no client JS.
 * Horizontal on wide screens, it stacks to a vertical flow on narrow ones.
 */
export function Architecture ({ nodes, caption }: { nodes: ArchNode[], caption?: string }): JSX.Element {
  return (
    <figure className='arch'>
      <ol className='arch-flow'>
        {nodes.map((n, i) => (
          <li key={i} className={`arch-node tone-${n.tone ?? 'context'}`}>
            <div className='arch-box'>
              <span className='arch-label'>{n.label}</span>
              {n.sub !== undefined && <span className='arch-sub'>{n.sub}</span>}
            </div>
            {i < nodes.length - 1 && <span className='arch-arrow' aria-hidden='true' />}
          </li>
        ))}
      </ol>
      {caption !== undefined && <figcaption className='arch-caption'>{caption}</figcaption>}
    </figure>
  )
}
