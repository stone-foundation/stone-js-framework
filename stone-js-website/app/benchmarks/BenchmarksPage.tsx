import { JSX } from 'react'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'

const METRICS = [
  { m: 'Cold start', why: 'Time to first response on a fresh serverless instance.' },
  { m: 'Throughput & latency', why: 'Requests/s and p50/p99 under load.' },
  { m: 'Memory', why: 'Resident footprint per instance.' },
  { m: 'Bundle size', why: 'Shipped bytes per deploy target.' },
  { m: 'Build time', why: 'Cold and incremental.' },
  { m: 'Lines of code', why: 'The same feature, across frameworks.' }
]

/**
 * Benchmarks landing (header nav, own section). The reproducible comparison repo
 * lands next; this states the method and the metrics.
 */
@Page('/benchmarks', { layout: 'site' })
export class BenchmarksPage implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Benchmarks · Stone.js',
      description: 'An open, reproducible comparison: the same project built with Stone.js and popular frameworks, on the metrics enterprises care about, including the same domain across every runtime.'
    }
  }

  render (): JSX.Element {
    return (
      <div className='wrap st-wrap'>
        <header className='section-hero'>
          <p className='eyebrow'><span className='psi'>ψ</span>Open & reproducible</p>
          <h1 className='mono-title'>Benchmarks</h1>
          <p className='lede'>
            The same project, built with Stone.js and popular frameworks, measured honestly and
            regeneratable by anyone. Including the metric no single-target framework can match: one
            domain, deployed and measured across Node, serverless and the edge.
          </p>
        </header>
        <p className='st-count'>Method, coming soon</p>
        <div className='st-grid'>
          {METRICS.map((x) => (
            <article key={x.m} className='st-card is-soon'>
              <div className='st-card-head'><span className='st-badge'>metric</span></div>
              <h3 className='st-title'>{x.m}</h3>
              <p className='st-desc-static'>{x.why}</p>
            </article>
          ))}
        </div>
      </div>
    )
  }
}
