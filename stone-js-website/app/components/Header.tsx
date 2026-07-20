import { Portal } from './brand/Portal'
import { scrollToHash } from './ScrollToHash'
import { JSX, MouseEvent, useEffect } from 'react'

const GITHUB_URL = 'https://github.com/stone-foundation'
const MANIFESTO_URL = 'https://evens-stone.github.io/continuum-manifesto/manifesto'

/**
 * Smooth-scrolls to a same-page section, bypassing any router interception of the
 * bare `#hash` click (which would otherwise cancel the native jump and go nowhere).
 */
function onHashClick (event: MouseEvent<HTMLAnchorElement>, hash: string): void {
  if (scrollToHash(hash)) {
    event.preventDefault()
    history.pushState(null, '', hash)
  }
}

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
export function Header (): JSX.Element {
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
            <a href='/docs'>Docs</a>
            <a href='#ecosystem' onClick={(e) => onHashClick(e, '#ecosystem')}>Ecosystem</a>
            <a href='#agents' onClick={(e) => onHashClick(e, '#agents')}>Agents</a>
            <a href={MANIFESTO_URL} target='_blank' rel='noopener noreferrer'>Manifesto</a>
          </div>
          <div className='spacer' />
          <span className='ver'>v0.8.0</span>
          <button className='icon-btn' onClick={toggleTheme} aria-label='Toggle theme' title='Toggle theme'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z' />
            </svg>
          </button>
          <a className='icon-btn' href={GITHUB_URL} target='_blank' rel='noopener noreferrer' aria-label='Stone.js on GitHub' title='GitHub'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
              <path d='M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z' />
            </svg>
          </a>
        </nav>
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
          <p className='muted' style={{ margin: '8px 0 0' }}>Build once, deploy anywhere.</p>
        </div>
        <div className='muted right'>
          An open-source project by <strong style={{ color: 'var(--encre)' }}>Stone Foundation</strong><br />
          Created by Mr. Stone (Evens Pierre)
        </div>
      </div>
    </footer>
  )
}
