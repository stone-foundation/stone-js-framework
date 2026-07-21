import { Portal } from '../components/brand/Portal'
import { CSSProperties, JSX, useRef, useState } from 'react'

const MANIFESTO_URL = 'https://evens-stone.github.io/continuum-manifesto/manifesto'
const CAPTION = 'hover the atom · observe · collapse ψ'

interface Electron { name: string, th: string, r: string, fd: string, fD: string }
interface Dot { th: string, r: string, sz: string, copper?: boolean }
interface Orbit { cls: string, electrons: Electron[], dots: Dot[] }

/** Adapter clouds: three counter-rotating orbits around the nucleus (the domain). */
const ORBITS: Orbit[] = [
  {
    cls: 'o1',
    electrons: [
      { name: 'node-http', th: '262deg', r: '214px', fd: '3.4s', fD: '.1s' },
      { name: 'aws-lambda', th: '78deg', r: '214px', fd: '2.9s', fD: '.6s' },
      { name: 'gcp·azure', th: '340deg', r: '214px', fd: '3.3s', fD: '.4s' }
    ],
    dots: [
      { th: '150deg', r: '214px', sz: '4px', copper: true },
      { th: '200deg', r: '214px', sz: '6px' }
    ]
  },
  {
    cls: 'o2',
    electrons: [
      { name: 'cloudflare', th: '180deg', r: '156px', fd: '3.8s', fD: '.3s' },
      { name: 'browser', th: '0deg', r: '156px', fd: '3.1s', fD: '.8s' },
      { name: 'node-ws', th: '110deg', r: '156px', fd: '3.5s', fD: '.7s' }
    ],
    dots: [
      { th: '250deg', r: '156px', sz: '4px' },
      { th: '300deg', r: '156px', sz: '5px', copper: true }
    ]
  },
  {
    cls: 'o3',
    electrons: [
      { name: 'mcp·agents', th: '120deg', r: '102px', fd: '2.7s', fD: '.2s' },
      { name: 'deno·bun', th: '300deg', r: '102px', fd: '3.6s', fD: '.5s' }
    ],
    dots: [
      { th: '40deg', r: '102px', sz: '4px' },
      { th: '210deg', r: '102px', sz: '5px', copper: true }
    ]
  }
]

const ALL_NAMES = ORBITS.flatMap((orbit) => orbit.electrons.map((e) => e.name))

/**
 * The hero: the atom. Nucleus is the domain (Le Portail), the clouds are the
 * adapters. Hovering is the observation: the wave collapses into one context,
 * leaving re-enters superposition.
 */
export function HeroAtom (): JSX.Element {
  const [chosen, setChosen] = useState<string | null>(null)
  const hot = useRef(0)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const collapseTo = (name: string): void => {
    clearTimeout(leaveTimer.current)
    setChosen(name)
  }
  const onAtomEnter = (): void => { collapseTo(ALL_NAMES[hot.current % ALL_NAMES.length]) }
  const onAtomLeave = (): void => {
    leaveTimer.current = setTimeout(() => {
      setChosen(null)
      hot.current = (hot.current + 1) % ALL_NAMES.length
    }, 350)
  }

  return (
    <div className='hero'>
      <div className='halo' />
      <div className='wrap'>
        <div className='atom-stage'>
        <div
          className={`atom ${chosen !== null ? 'collapsed' : ''}`}
          onMouseEnter={onAtomEnter}
          onMouseLeave={onAtomLeave}
        >
          <div className='shock' />
          {ORBITS.map((orbit) => (
            <div key={orbit.cls} className={`orbit ${orbit.cls}`}>
              {orbit.electrons.map((e) => (
                <span
                  key={e.name}
                  className={`e ${chosen === e.name ? 'chosen' : ''}`}
                  style={{ '--th': e.th, '--r': e.r } as CSSProperties}
                >
                  <span className='s' style={{ '--th': e.th } as CSSProperties}>
                    <span className='u'>
                      <button
                        className='chip'
                        style={{ '--fd': e.fd, '--fD': e.fD } as CSSProperties}
                        onMouseEnter={(ev) => { ev.stopPropagation(); hot.current = ALL_NAMES.indexOf(e.name); collapseTo(e.name) }}
                        onFocus={() => collapseTo(e.name)}
                        onClick={() => collapseTo(e.name)}
                      >
                        {e.name}
                      </button>
                    </span>
                  </span>
                </span>
              ))}
              {orbit.dots.map((dot, i) => (
                <i
                  key={i}
                  className='pdot'
                  style={{ '--th': dot.th, '--r': dot.r, '--sz': dot.sz, ...(dot.copper === true ? { '--pc': 'var(--cuivre)' } : {}) } as CSSProperties}
                />
              ))}
            </div>
          ))}
          <Portal size={122} id='bz-nucleus' className='nucleus' keyClassName='key' />
        </div>
        </div>

        <p className='atom-caption'>
          {chosen === null ? CAPTION : <>ψ collapsed → <b>{chosen}</b></>}
        </p>
        <span className='sr-live' role='status'>{chosen === null ? '' : `Wave function collapsed. Running on ${chosen}.`}</span>

        <p className='eyebrow'><span className='psi'>ψ</span>The Continuum Framework</p>
        <h1 className='mono-title'>
          Your app exists in <span className='shimmer'>every runtime</span>.<br />
          Until you run it.
        </h1>
        <p className='lede'>
          Write the domain once. It lives in superposition across every context: server, edge,
          browser, agents. Running it is the observation that collapses it into one.
          Stone.js orchestrates the collapse.
        </p>
        <div className='equation'>
          Application <span className='g'>=</span> <b>Domain</b> <span className='g'>×</span> <b>Context</b> <span className='g'>→</span> Resolution
        </div>
        <div className='cta-row'>
          <a className='btn btn-primary' href='/docs/start/install'>npm create @stone-js</a>
          <a className='btn btn-ghost hero-docs' href='/docs'>Read the docs</a>
          <a className='btn btn-ghost' href={MANIFESTO_URL} target='_blank' rel='noopener noreferrer'>Read the manifesto →</a>
        </div>
      </div>
    </div>
  )
}
