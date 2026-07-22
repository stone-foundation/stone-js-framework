import { Toc } from './components/Toc'
import { Search } from './components/Search'
import { Breadcrumbs } from './components/Breadcrumbs'
import { Footer } from '../components/Header'
import { ScrollToHash } from '../components/ScrollToHash'
import { Analytics, trackPageView } from '../components/Analytics'
import { Portal } from '../components/brand/Portal'
import { ParadigmSwitch, Paradigm, readParadigm } from './components/ParadigmSwitch'
import { Sidebar, useCurrentPath } from './components/Sidebar'
import { JSX, ReactNode, useEffect, useState } from 'react'
import { IPageLayout, PageLayout, PageLayoutRenderContext, StoneLink, StoneOutlet } from '@stone-js/use-react'

const GITHUB_URL = 'https://github.com/stone-foundation'

/** The theme toggle icon, reused in the bar and the mobile overflow menu. */
function MoonIcon (): JSX.Element {
  return <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z' /></svg>
}

/** The GitHub mark, reused in the bar and the mobile overflow menu. */
function GitHubIcon (): JSX.Element {
  return <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'><path d='M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z' /></svg>
}

/** Restores theme and paradigm before first paint, so there is no flash. */
const NO_FLASH = `(function(){try{var d=document.documentElement,t=localStorage.getItem('stone-theme'),p=localStorage.getItem('stone-paradigm');d.setAttribute('data-theme',t||'dark');if(p)d.setAttribute('data-paradigm',p);}catch(e){d.setAttribute('data-theme','dark');}})();`

/** Toggles the color theme and persists it. */
function toggleTheme (): void {
  const root = document.documentElement
  const current = root.getAttribute('data-theme') ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const next = current === 'dark' ? 'light' : 'dark'
  root.setAttribute('data-theme', next)
  try { localStorage.setItem('stone-theme', next) } catch {}
}

/**
 * The docs shell: a function component so it can hold the mobile-drawer state
 * (a layout class cannot use hooks). Header, sidebar, article outlet, TOC, footer.
 */
function DocShell ({ children }: { children: ReactNode }): JSX.Element {
  const currentPath = useCurrentPath()
  const [drawer, setDrawer] = useState(false)
  const [menu, setMenu] = useState(false)
  const [paradigm, setParadigm] = useState<Paradigm>('declarative')

  // Restore the persisted theme and paradigm on mount, so the CSS reveals the
  // right code and the choice survives a navigation or a refresh.
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('stone-theme')
      if (savedTheme !== null) document.documentElement.setAttribute('data-theme', savedTheme)
    } catch {}
    const p = readParadigm()
    setParadigm(p)
    document.documentElement.setAttribute('data-paradigm', p)
  }, [])

  const chooseParadigm = (next: Paradigm): void => {
    setParadigm(next)
    document.documentElement.setAttribute('data-paradigm', next)
    try { localStorage.setItem('stone-paradigm', next) } catch {}
  }

  // Close the drawer and overflow menu, and record a page view, on route change.
  useEffect(() => {
    setDrawer(false)
    setMenu(false)
    if (currentPath !== '') trackPageView(currentPath)
  }, [currentPath])

  // Dismiss the overflow menu on any click outside it.
  useEffect(() => {
    if (!menu) return
    const onDoc = (e: Event): void => {
      if ((e.target as Element)?.closest?.('.dh-more') === null) setMenu(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [menu])

  return (
    <div className={`docs-root ${drawer ? 'drawer-open' : ''}`}>
      <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      <Analytics />
      <ScrollToHash />
      <header className='docs-header'>
        <div className='dh-inner'>
          <button className='icon-btn menu-btn' aria-label='Toggle menu' aria-expanded={drawer} onClick={() => setDrawer((v) => !v)}>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M3 6h18M3 12h18M3 18h18' /></svg>
          </button>
          <StoneLink to='/' className='brand'>
            <Portal size={26} id='bz-docs' />
            Stone<span className='dot'>.</span>js
          </StoneLink>
          <span className='dh-crumb'>Docs</span>
          <div className='spacer' />
          <Search />
          <div className='dh-tools'>
            <ParadigmSwitch value={paradigm} onChange={chooseParadigm} />
            <button className='icon-btn' onClick={toggleTheme} aria-label='Toggle theme' title='Toggle theme'><MoonIcon /></button>
            <a className='icon-btn' href={GITHUB_URL} target='_blank' rel='noopener noreferrer' aria-label='GitHub' title='GitHub'><GitHubIcon /></a>
          </div>
          <div className='dh-more'>
            <button className='icon-btn' aria-label='More' aria-haspopup='true' aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor'><circle cx='12' cy='5' r='1.8' /><circle cx='12' cy='12' r='1.8' /><circle cx='12' cy='19' r='1.8' /></svg>
            </button>
            {menu && (
              <div className='dh-menu' role='menu'>
                <ParadigmSwitch value={paradigm} onChange={chooseParadigm} />
                <div className='dh-menu-row'>
                  <button className='dh-menu-item' onClick={toggleTheme}><MoonIcon />Theme</button>
                  <a className='dh-menu-item' href={GITHUB_URL} target='_blank' rel='noopener noreferrer'><GitHubIcon />GitHub</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className='drawer-scrim' onClick={() => setDrawer(false)} aria-hidden='true' />

      <div className='docs-grid'>
        <aside className='docs-aside'>
          <Sidebar currentPath={currentPath} onNavigate={() => setDrawer(false)} />
        </aside>
        <main className='docs-main'>
          <article className='doc-article'>
            <Breadcrumbs path={currentPath} />
            <StoneOutlet>{children}</StoneOutlet>
          </article>
          <Footer />
        </main>
        <aside className='docs-toc'>
          <Toc pathKey={currentPath} />
        </aside>
      </div>
    </div>
  )
}

/**
 * The documentation layout. Registered as the default docs frame; pages opt in
 * with `@Page(path, { layout: 'docs' })`.
 */
@PageLayout({ name: 'docs' })
export class DocLayout implements IPageLayout {
  render ({ children }: PageLayoutRenderContext): ReactNode {
    return <DocShell>{children}</DocShell>
  }
}
