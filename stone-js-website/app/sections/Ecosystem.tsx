import { Reveal } from '../components/ui/Reveal'
import { JSX, useEffect, useRef } from 'react'

const STATS = [
  { value: 45, label: 'packages' },
  { value: 15, label: 'deploy targets' },
  { value: 2, label: 'paradigms, 1:1' },
  { value: 100, suffix: '%', label: 'behavioural tests' }
]

const MODULES = [
  { tier: 'extension', name: '@stone-js/validation', text: 'One schema, validated on the backend and the frontend form.', href: '/docs/extensions/validation' },
  { tier: 'extension', name: '@stone-js/auth', text: 'Stateless JWT/OAuth on jose: edge-native, no session.', href: '/docs/extensions/auth' },
  { tier: 'extension', name: '@stone-js/realtime', text: 'One Broadcaster API, backend and frontend: channels and presence.', href: '/docs/extensions/realtime' },
  { tier: 'extension', name: '@stone-js/event-bus', text: 'Emit domain events to local and cloud targets; route them anywhere.', href: '/docs/extensions/event-bus' },
  { tier: 'adapter', name: '@stone-js/fetch-adapter', text: 'One Web-standard adapter for Cloudflare, Deno, Bun, Vercel, Netlify.', href: '/docs/adapters/fetch' },
  { tier: 'extension', name: '@stone-js/mcp-dev', text: 'Serve the framework + your app to a coding agent: `stone mcp`.', href: '/docs/extensions/mcp' },
  { tier: 'extension', name: '@stone-js/queue', text: 'Dispatch work now or later, process with a worker, retry with backoff.', href: '/docs/extensions/queue' },
  { tier: 'extension', name: '@stone-js/openapi', text: 'A public contract derived from the schemas you already write.', href: '/docs/extensions/openapi' }
]

/** Animates a number from 0 to its target when it becomes visible. */
function Stat ({ value, suffix = '', label }: { value: number, suffix?: string, label: string }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el === null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = `${value}${suffix}`
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        io.unobserve(el)
        const duration = 1100
        let start: number | null = null
        const step = (ts: number): void => {
          start = start ?? ts
          const k = Math.min(1, (ts - start) / duration)
          el.textContent = `${Math.round(value * (1 - Math.pow(1 - k, 3)))}${suffix}`
          if (k < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      })
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [value, suffix])

  return (
    <div className='stat'>
      <div className='num' ref={ref}>0{suffix}</div>
      <div className='lbl'>{label}</div>
    </div>
  )
}

/**
 * The ecosystem: a keystone kernel, everything else plugs in. Marketplace teaser.
 */
export function Ecosystem (): JSX.Element {
  return (
    <section id='ecosystem'>
      <div className='wrap'>
        <Reveal className='sec-head'>
          <p className='eyebrow'><span className='psi'>ψ</span>The ecosystem</p>
          <h2>A keystone kernel. Everything else plugs in.</h2>
          <p>
            The core knows nothing of HTTP, CLI or the browser. Adapters and extensions graft
            onto it through blueprints, never the other way around. Browse the marketplace:
          </p>
        </Reveal>
        <Reveal>
          <div className='stats'>
            {STATS.map((s) => <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />)}
          </div>
        </Reveal>
        <div className='mods'>
          {MODULES.map((m) => (
            <Reveal key={m.name} href={m.href} className='mod'>
              <span className='tier'>{m.tier}</span>
              <h3>{m.name}</h3>
              <p>{m.text}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className='market-cta'>
          <a className='btn btn-ghost' href='/ecosystem'>Browse the full ecosystem →</a>
        </Reveal>
      </div>
    </section>
  )
}
