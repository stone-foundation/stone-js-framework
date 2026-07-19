import { JSX } from 'react'
import { Reveal } from '../components/ui/Reveal'

const STRATA = [
  { era: 'Agents', note: 'Your app as MCP tools: the runtime that talks back', year: '2025 →' },
  { era: 'Edge', note: 'Workers, isolates, WinterCG', year: '2020' },
  { era: 'Serverless', note: 'Functions, cold starts, pay-per-call', year: '2015' },
  { era: 'Containers', note: 'Docker, orchestration', year: '2013' },
  { era: 'Node', note: 'JavaScript leaves the browser', year: '2009' },
  { era: 'LAMP', note: 'The monolith years', year: '2004' },
  { era: 'CGI', note: 'Where it all began', year: '1995' }
]

/**
 * The geological record: thirty years of execution contexts as strata, crossed
 * by one braise vein. Frameworks welded to their era fossilised with it; a
 * domain that stayed in superposition crosses every stratum.
 */
export function Strata (): JSX.Element {
  return (
    <section id='eras'>
      <div className='wrap'>
        <Reveal className='sec-head'>
          <p className='eyebrow'><span className='psi'>ψ</span>The geological record</p>
          <h2>Each era buried the last one's frameworks.</h2>
          <p>
            A cross-section of thirty years of execution contexts. Frameworks welded to their
            era went down with it: collapsed states, fossilised in place. The vein that crosses
            every stratum is a domain that never collapsed. It stayed in superposition.
          </p>
        </Reveal>
        <Reveal>
          <div className='strata'>
            <div className='vein' aria-hidden='true' />
            {STRATA.map((s) => (
              <div key={s.era} className='stratum'>
                <span className='era'>{s.era}</span>
                <span className='note'>{s.note}</span>
                <span className='year'>{s.year}</span>
              </div>
            ))}
          </div>
          <p className='strata-caption'>the <b>same domain</b> crosses every stratum · that is the continuum</p>
        </Reveal>
      </div>
    </section>
  )
}
