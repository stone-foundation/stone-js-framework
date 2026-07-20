import { STARTERS, Starter, StarterTarget, StarterParadigm } from './registry'
import { JSX, useMemo, useState } from 'react'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'

const GITHUB_REGISTRY = 'https://github.com/stone-foundation/stone-js-starters'

/** Copy-to-clipboard button that confirms briefly. */
function Copy ({ text }: { text: string }): JSX.Element {
  const [done, setDone] = useState(false)
  const copy = (): void => {
    const ok = (): void => { setDone(true); setTimeout(() => setDone(false), 1500) }
    if (navigator.clipboard?.writeText !== undefined) void navigator.clipboard.writeText(text).then(ok, () => {})
    else ok()
  }
  return <button className='st-copy' onClick={copy} aria-label={done ? 'Copied' : 'Copy command'}>{done ? 'Copied' : 'Copy'}</button>
}

/** One starter card: badges, collapsed description, command, About, repo. */
function Card ({ s, onAbout }: { s: Starter, onAbout: (s: Starter) => void }): JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <article className='st-card'>
      <div className='st-card-head'>
        <span className={`st-badge ${s.official ? 'is-official' : 'is-community'}`}>{s.official ? 'Official' : 'Community'}</span>
        <span className='st-badge'>{s.target}</span>
        <span className='st-badge'>{s.paradigm}</span>
      </div>
      <h3 className='st-title'>{s.title}</h3>
      <button className='st-desc-toggle' aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? s.description : `${s.description.slice(0, 62)}${s.description.length > 62 ? '…' : ''}`}
        <span className='st-chev'>{open ? '−' : '+'}</span>
      </button>
      <div className='st-cmd'>
        <code>{s.command}</code>
        <Copy text={s.command} />
      </div>
      <div className='st-card-foot'>
        <button className='st-link' onClick={() => onAbout(s)}>About</button>
        <a className='st-link' href={s.repo} target='_blank' rel='noopener noreferrer'>Source →</a>
      </div>
    </article>
  )
}

/** The starters catalogue: filters + grid, all from the registry. */
function Catalogue (): JSX.Element {
  const [scope, setScope] = useState<'all' | 'official' | 'community'>('all')
  const [target, setTarget] = useState<'all' | StarterTarget>('all')
  const [paradigm, setParadigm] = useState<'all' | StarterParadigm>('all')
  const [about, setAbout] = useState<Starter | null>(null)

  const list = useMemo(() => STARTERS.filter((s) =>
    (scope === 'all' || (scope === 'official' ? s.official : !s.official)) &&
    (target === 'all' || s.target === target) &&
    (paradigm === 'all' || s.paradigm === paradigm)
  ), [scope, target, paradigm])

  return (
    <div className='wrap st-wrap'>
      <header className='section-hero'>
        <p className='eyebrow'><span className='psi'>ψ</span>Ready to use</p>
        <h1 className='mono-title'>Starters</h1>
        <p className='lede'>
          Scaffold a working Stone.js app in one command. Official templates and community
          solutions, every one a real repo you can run and deploy anywhere.
        </p>
      </header>

      <div className='st-filters' role='group' aria-label='Filter starters'>
        <div className='st-fgroup'>
          {(['all', 'official', 'community'] as const).map((v) => (
            <button key={v} className={`st-fbtn ${scope === v ? 'active' : ''}`} onClick={() => setScope(v)}>{v}</button>
          ))}
        </div>
        <div className='st-fgroup'>
          {(['all', 'backend', 'frontend', 'edge', 'full'] as const).map((v) => (
            <button key={v} className={`st-fbtn ${target === v ? 'active' : ''}`} onClick={() => setTarget(v)}>{v}</button>
          ))}
        </div>
        <div className='st-fgroup'>
          {(['all', 'decorators', 'define*', 'both'] as const).map((v) => (
            <button key={v} className={`st-fbtn ${paradigm === v ? 'active' : ''}`} onClick={() => setParadigm(v)}>{v}</button>
          ))}
        </div>
      </div>

      <p className='st-count'>{list.length} starter{list.length === 1 ? '' : 's'}</p>
      <div className='st-grid'>
        {list.map((s) => <Card key={s.id} s={s} onAbout={setAbout} />)}
      </div>

      <aside className='st-contribute'>
        <h2>Share your solution</h2>
        <p>
          Built something worth reusing? Add it to the registry with a PR. First-party and community
          starters sit side by side, the same way first-party and community modules do.
        </p>
        <a className='btn btn-ghost' href={GITHUB_REGISTRY} target='_blank' rel='noopener noreferrer'>Add your starter →</a>
      </aside>

      {about !== null && (
        <div className='st-modal-scrim' onClick={() => setAbout(null)}>
          <div className='st-modal' role='dialog' aria-modal='true' aria-label={about.title} onClick={(e) => e.stopPropagation()}>
            <button className='st-modal-close' onClick={() => setAbout(null)} aria-label='Close'>×</button>
            <div className='st-card-head'>
              <span className={`st-badge ${about.official ? 'is-official' : 'is-community'}`}>{about.official ? 'Official' : 'Community'}</span>
              <span className='st-badge'>{about.target}</span>
              <span className='st-badge'>{about.paradigm}</span>
            </div>
            <h3 className='st-title'>{about.title}</h3>
            <p className='st-about'>{about.about}</p>
            <p className='st-about-meta'>By {about.author}{about.blogSlug !== undefined ? ' · featured in the blog' : ''}</p>
            <div className='st-cmd'><code>{about.command}</code><Copy text={about.command} /></div>
            <a className='st-link' href={about.repo} target='_blank' rel='noopener noreferrer'>Source →</a>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Starters catalogue page (header nav, own section, not docs).
 */
@Page('/starters', { layout: 'site' })
export class StartersPage implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Starters · Stone.js',
      description: 'Ready-to-use Stone.js starters: official templates and community solutions, scaffolded in one command and deployable anywhere.'
    }
  }

  render (): JSX.Element {
    return <Catalogue />
  }
}
