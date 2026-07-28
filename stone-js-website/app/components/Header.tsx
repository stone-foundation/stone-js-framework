import { Portal } from './brand/Portal'
import { DISCORD_URL, GITHUB_URL, MANIFESTO_URL } from '../site'
import { StoneLink, useBlueprint } from '@stone-js/use-react'
import { JSX, useEffect, useState } from 'react'

/** Toggles the color theme and persists the choice. */
function toggleTheme (): void {
  const root = document.documentElement
  const current = root.getAttribute('data-theme') ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const next = current === 'dark' ? 'light' : 'dark'
  root.setAttribute('data-theme', next)
  try { localStorage.setItem('stone-theme', next) } catch {}
}

/**
 * The site header: brand, primary navigation, version, theme toggle, GitHub.
 */
const NAV_LINKS: Array<{ to: string, label: string, external?: boolean }> = [
  { to: '/docs', label: 'Docs' },
  { to: '/ecosystem', label: 'Modules' },
  { to: '/starters', label: 'Starters' },
  { to: '/blog', label: 'Blog' },
  { to: MANIFESTO_URL, label: 'Manifesto', external: true }
]

export function Header (): JSX.Element {
  const [open, setOpen] = useState(false)
  const version = useBlueprint().get<string>('app.version', '')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('stone-theme')
      if (saved !== null) { document.documentElement.setAttribute('data-theme', saved) }
    } catch {}
  }, [])

  return (
    <header className='site-header'>
      <div className='wrap'>
        <nav>
          <a className='brand' href='/' aria-label='Stone.js home'>
            <Portal size={30} id='bz-nav' />
            Stone<span className='dot'>.</span>js
          </a>
          <div className='links'>
            {NAV_LINKS.map((l) => (
              l.external === true
                ? <a key={l.to} href={l.to} target='_blank' rel='noopener noreferrer'>{l.label}</a>
                : <StoneLink key={l.to} to={l.to}>{l.label}</StoneLink>
            ))}
          </div>
          <div className='spacer' />
          <button
            className='icon-btn menu-btn'
            aria-label='Menu'
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              {open
                ? <path d='M6 6l12 12M18 6L6 18' />
                : <path d='M3 6h18M3 12h18M3 18h18' />}
            </svg>
          </button>
          <span className='ver'>v{version}</span>
          <button className='icon-btn' onClick={toggleTheme} aria-label='Toggle theme' title='Toggle theme'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z' />
            </svg>
          </button>
          <a className='icon-btn' href={DISCORD_URL} target='_blank' rel='noopener noreferrer' aria-label='Join the Stone.js Discord' title='Discord'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
              <path d='M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' />
            </svg>
          </a>
          <a className='icon-btn' href={GITHUB_URL} target='_blank' rel='noopener noreferrer' aria-label='Stone.js on GitHub' title='GitHub'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
              <path d='M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z' />
            </svg>
          </a>
        </nav>
        {open && (
          <div className='mobile-menu'>
            {NAV_LINKS.map((l) => (
              l.external === true
                ? <a key={l.to} href={l.to} target='_blank' rel='noopener noreferrer' onClick={() => setOpen(false)}>{l.label}</a>
                : <StoneLink key={l.to} to={l.to} onClick={() => setOpen(false)}>{l.label}</StoneLink>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

/**
 * The site footer: slogan and attribution.
 */
export function Footer (): JSX.Element {
  return (
    <footer className='site-footer'>
      <hr className='rule' />
      <div className='wrap foot'>
        <div>
          <div className='slogan'>Stone<span className='dot'>.</span>js</div>
          <p className='muted' style={{ margin: '8px 0 0' }}>Your app exists in every runtime. Until you run it.</p>
        </div>
        <nav className='foot-links' aria-label='Community'>
          <a href={`${GITHUB_URL}/stone-js-framework`} target='_blank' rel='noopener noreferrer'>GitHub</a>
          <a href={DISCORD_URL} target='_blank' rel='noopener noreferrer'>Discord</a>
          <a href={`${GITHUB_URL}/stone-js-framework/discussions`} target='_blank' rel='noopener noreferrer'>Discussions</a>
          <a href={`${GITHUB_URL}/stone-js-framework/blob/main/ROADMAP.md`} target='_blank' rel='noopener noreferrer'>Roadmap</a>
        </nav>
        <div className='muted right'>
          An open-source project by <strong style={{ color: 'var(--encre)' }}>Stone Foundation</strong><br />
          Created by Mr. Stone (Evens Pierre)
        </div>
      </div>
    </footer>
  )
}
