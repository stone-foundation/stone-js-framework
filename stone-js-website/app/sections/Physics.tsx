import { JSX } from 'react'
import { Reveal } from '../components/ui/Reveal'

const LAWS = [
  {
    glyph: 'Σ',
    sym: 'SUPERPOSITION',
    title: 'All contexts, latent',
    text: 'From the system\'s point of view, the outer context is in superposition: every platform, request and input source exists in potential, as long as none has been integrated, selected, collapsed.'
  },
  {
    glyph: '→',
    sym: 'OBSERVATION',
    title: 'Runtime is the measurement',
    text: 'At runtime, in the integration dimension, the intention is collapsed, normalised and stabilised into a usable internal context. That decoherence is where raw reality meets your logic.'
  },
  {
    glyph: '∞',
    sym: 'ENTANGLEMENT',
    title: 'Backend ⟷ frontend, correlated',
    text: 'One schema validates the API and the form. One rule guards the route and shapes the UI. Measure one side: the other is already correct.'
  },
  {
    glyph: 'Δ',
    sym: 'CONTEXTUAL UNCERTAINTY',
    title: 'Defer the where. Own the what.',
    text: 'A domain cannot, at the same time, know its execution context exactly and evolve independently of it. Know it too well and you are coupled; ignore it and you fail the intent. Stone.js keeps the where uncertain while you build the what, at full speed.'
  }
]

/**
 * The principle: the Continuum, borrowed from quantum mechanics.
 * Copy follows the Continuum manifesto.
 */
export function Physics (): JSX.Element {
  return (
    <section id='physics'>
      <div className='wrap'>
        <Reveal className='sec-head'>
          <p className='eyebrow'><span className='psi'>ψ</span>The principle</p>
          <h2>Architecture, borrowed from quantum mechanics.</h2>
          <p>
            The Continuum is built on the uncertainty principle and wave-function collapse,
            applied to software. Not a metaphor for show: each law maps to a mechanism we ship.
          </p>
        </Reveal>
        <div className='physics'>
          {LAWS.map((law) => (
            <Reveal key={law.sym} className='phys'>
              <span className='glyph'>{law.glyph}</span>
              <p className='sym'>{law.sym}</p>
              <h3>{law.title}</h3>
              <p>{law.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
