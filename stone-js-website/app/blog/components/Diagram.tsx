import { JSX } from 'react'

/**
 * Diagram: bespoke, brand-aligned conceptual diagrams for the blog.
 *
 * Not boxes-and-arrows. Nodes are capsules with a leading accent, connectors are curved gradient
 * beziers with an optional animated flow, and the subject of each story gets a glowing core. It
 * renders to static SVG at build time (SSG + SEO friendly, no client JS), is theme-aware through
 * CSS variables, and honours `prefers-reduced-motion`.
 *
 * Two semantic layouts remove coordinate math from the author:
 *  - `flow`: a left-to-right sequence (a pipeline, a lifecycle).
 *  - `hub`:  one core resolved by many satellites (the Continuum thesis: one domain, many contexts).
 */

export type NodeKind = 'core' | 'context' | 'client' | 'domain' | 'store' | 'ghost'

export interface DiagramNode {
  label: string
  sub?: string
  kind?: NodeKind
}

export interface DiagramEdge {
  /** Node indices. */
  from: number
  to: number
  /** Perpendicular bend, in viewBox units (positive curves one way, negative the other). */
  curve?: number
  /** Arrow direction. */
  dir?: 'to' | 'both' | 'none'
  /** Animate a travelling flow along the edge. */
  flow?: boolean
  /** Render dashed (a bypass, a "metadata only" hop). */
  dashed?: boolean
  /** Short label riding the edge. */
  label?: string
}

interface Placed extends DiagramNode { x: number, y: number, w: number }

const CH = 8.2 // approx advance per character at the label size
const PILL_H = 46
const CORE_H = 58

function widthFor (n: DiagramNode): number {
  const base = Math.max((n.label?.length ?? 0) * CH + 46, 116)
  return n.kind === 'core' ? Math.max(base, 168) : base
}

/** Control point for a quadratic arc between two points, bent by `curve` on the perpendicular. */
function control (ax: number, ay: number, bx: number, by: number, curve: number): [number, number] {
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  if (curve === 0) return [mx, my]
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  return [mx + (-dy / len) * curve, my + (dx / len) * curve]
}

function place (nodes: DiagramNode[], layout: 'flow' | 'hub', W: number, H: number): Placed[] {
  if (layout === 'hub') {
    const cx = W / 2
    const cy = H / 2
    const rx = W / 2 - 130
    const ry = H / 2 - 74
    const sats = nodes.slice(1)
    return nodes.map((n, i) => {
      if (i === 0) return { ...n, kind: n.kind ?? 'core', x: cx, y: cy, w: widthFor({ ...n, kind: 'core' }) }
      // Distribute the satellites evenly around an ellipse, starting from the top.
      const a = (Math.PI * 2 * (i - 1)) / sats.length - Math.PI / 2
      return { ...n, x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, w: widthFor(n) }
    })
  }
  // flow: evenly spaced single row, keeping the end pills fully inside the viewBox
  const y = H / 2
  const margin = Math.max(...nodes.map(widthFor)) / 2 + 12
  const step = nodes.length > 1 ? (W - margin * 2) / (nodes.length - 1) : 0
  return nodes.map((n, i) => ({ ...n, x: margin + step * i, y, w: widthFor(n) }))
}

export interface DiagramProps {
  layout?: 'flow' | 'hub'
  nodes: DiagramNode[]
  /** Extra/override edges. Defaults: flow links consecutive nodes; hub links core to each satellite. */
  edges?: DiagramEdge[]
  caption?: string
  /** viewBox height; width is fixed at 760. */
  height?: number
}

export function Diagram ({ layout = 'flow', nodes, edges, caption, height }: DiagramProps): JSX.Element {
  const W = 760
  const H = height ?? (layout === 'hub' ? 440 : 220)
  const placed = place(nodes, layout, W, H)

  const defaultEdges: DiagramEdge[] = edges ?? (
    layout === 'hub'
      ? placed.slice(1).map((_, i) => ({ from: 0, to: i + 1, flow: true }))
      : placed.slice(1).map((_, i) => ({ from: i, to: i + 1, flow: true, curve: 0 }))
  )

  return (
    <figure className='dg'>
      <svg className='dg-svg' viewBox={`0 0 ${W} ${H}`} role='img' aria-label={caption ?? 'Diagram'} preserveAspectRatio='xMidYMid meet'>
        <defs>
          <linearGradient id='dg-braise' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stopColor='#FFC46B' />
            <stop offset='1' stopColor='#FF5A1F' />
          </linearGradient>
          <radialGradient id='dg-core' cx='0.5' cy='0.4' r='0.75'>
            <stop offset='0' stopColor='#FF7A38' />
            <stop offset='1' stopColor='#E0430C' />
          </radialGradient>
          <filter id='dg-glow' x='-40%' y='-40%' width='180%' height='180%'>
            <feDropShadow dx='0' dy='6' stdDeviation='10' floodColor='#FF5A1F' floodOpacity='0.28' />
          </filter>
          <marker id='dg-tip' markerWidth='9' markerHeight='9' refX='6.6' refY='4.5' orient='auto'>
            <path d='M1 1 L8 4.5 L1 8 Z' className='dg-tip' />
          </marker>
        </defs>

        <g className='dg-edges'>
          {defaultEdges.map((e, i) => {
            const a = placed[e.from]
            const b = placed[e.to]
            if (a === undefined || b === undefined) return null
            const curve = e.curve ?? 0
            const [cx, cy] = control(a.x, a.y, b.x, b.y, curve)
            const d = curve === 0 ? `M ${a.x} ${a.y} L ${b.x} ${b.y}` : `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
            const dir = e.dir ?? 'to'
            // Label rides the curve at its apex (t = 0.5 of the quadratic).
            const lx = 0.25 * a.x + 0.5 * cx + 0.25 * b.x
            const ly = 0.25 * a.y + 0.5 * cy + 0.25 * b.y - 6
            return (
              <g key={i}>
                <path
                  d={d}
                  className={`dg-edge${e.dashed === true ? ' is-dashed' : ''}`}
                  markerEnd={dir === 'to' || dir === 'both' ? 'url(#dg-tip)' : undefined}
                  markerStart={dir === 'both' ? 'url(#dg-tip)' : undefined}
                />
                {e.flow === true && <path d={d} className='dg-flow' />}
                {e.label !== undefined && <text x={lx} y={ly} className='dg-edge-label'>{e.label}</text>}
              </g>
            )
          })}
        </g>

        <g className='dg-nodes'>
          {placed.map((n, i) => {
            const isCore = n.kind === 'core'
            const h = isCore ? CORE_H : PILL_H
            return (
              <g key={i} className={`dg-node kind-${n.kind ?? 'context'}`} transform={`translate(${n.x} ${n.y})`}>
                <rect
                  x={-n.w / 2} y={-h / 2} width={n.w} height={h} rx={h / 2}
                  className='dg-pill'
                  filter={isCore ? 'url(#dg-glow)' : undefined}
                />
                <circle cx={-n.w / 2 + 20} cy={0} r={5} className='dg-dot' />
                <text x={-n.w / 2 + 34} y={n.sub !== undefined ? -2 : 5} className='dg-label' textAnchor='start'>{n.label}</text>
                {n.sub !== undefined && <text x={-n.w / 2 + 34} y={14} className='dg-sub' textAnchor='start'>{n.sub}</text>}
              </g>
            )
          })}
        </g>
      </svg>
      {caption !== undefined && <figcaption className='dg-caption'>{caption}</figcaption>}
    </figure>
  )
}
