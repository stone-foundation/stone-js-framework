import { JSX } from 'react'
import { Reveal } from '../components/ui/Reveal'

const MANIFESTO_URL = 'https://evens-stone.github.io/continuum-manifesto/manifesto'

/**
 * The manifesto: before the framework, an architecture. Its own band,
 * clearly separated from the final call to action.
 */
export function Manifesto (): JSX.Element {
  return (
    <div className='manifesto'>
      <div className='wrap'>
        <Reveal>
          <p className='eyebrow' style={{ textAlign: 'center' }}><span className='psi'>ψ</span>Before the framework</p>
          <blockquote>“An application is not an artefact.<br />It is <em>an act</em>.”</blockquote>
          <p className='src'>The Continuum Architecture manifesto</p>
          <a className='btn btn-ghost' href={MANIFESTO_URL} target='_blank' rel='noopener noreferrer'>Read the manifesto →</a>
        </Reveal>
      </div>
    </div>
  )
}

/**
 * The final call to action.
 */
export function FinalCta (): JSX.Element {
  return (
    <section className='cta-final'>
      <div className='wrap'>
        <Reveal className='sec-head center'>
          <h2>Learn the core once. Command every context.</h2>
          <p style={{ marginInline: 'auto' }}>One base of knowledge. Every dimension open: this era's, and the next.</p>
          <div className='cta-row' style={{ marginTop: 30 }}>
            <a className='btn btn-primary' href='/docs/start/install'>Get started</a>
            <a className='btn btn-ghost' href='/docs'>Explore the docs →</a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
