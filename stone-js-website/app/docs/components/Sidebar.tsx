import { JSX, useEffect, useState } from 'react'
import { StoneLink, useRouter } from '@stone-js/use-react'
import { RouteEvent } from '@stone-js/router'
import { DOC_NAV, DocLink, DocSection, sectionHasPath } from '../nav'

/** One page link (or a greyed `soon` placeholder). */
function Item ({ item, currentPath, onNavigate }: { item: DocLink, currentPath: string, onNavigate?: () => void }): JSX.Element {
  if (item.soon === true) {
    return <span className='side-link soon' aria-disabled='true'>{item.title}<span className='soon-tag'>soon</span></span>
  }
  return (
    <StoneLink to={item.path} className={`side-link ${currentPath === item.path ? 'active' : ''}`} onClick={onNavigate}>
      {item.title}
    </StoneLink>
  )
}

/** A collapsible section: its own items, then any labelled groups. */
function Section ({ section, currentPath, onNavigate }: { section: DocSection, currentPath: string, onNavigate?: () => void }): JSX.Element {
  const hasCurrent = sectionHasPath(section, currentPath)
  const [override, setOverride] = useState<boolean | null>(null)
  const open = override ?? hasCurrent

  // When navigation lands in this section, always reveal it: clear any manual
  // toggle so the active page's section opens rather than staying where it was.
  useEffect(() => {
    if (hasCurrent) setOverride(null)
  }, [hasCurrent])

  return (
    <div className={`side-section ${open ? 'open' : ''}`}>
      <button className='side-head' aria-expanded={open} onClick={() => setOverride(!open)}>
        <span className='side-title'>{section.title}</span>
        <svg className='side-chevron' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='m6 9 6 6 6-6' /></svg>
      </button>
      {open && (
        <div className='side-body'>
          {section.blurb !== '' && <p className='side-blurb'>{section.blurb}</p>}
          {section.items !== undefined && section.items.length > 0 && (
            <ul>{section.items.map((item) => <li key={item.path}><Item item={item} currentPath={currentPath} onNavigate={onNavigate} /></li>)}</ul>
          )}
          {(section.groups ?? []).map((group) => (
            <div key={group.title} className='side-group'>
              <p className='side-group-title'>{group.title}</p>
              <ul>{group.items.map((item) => <li key={item.path}><Item item={item} currentPath={currentPath} onNavigate={onNavigate} /></li>)}</ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The documentation sidebar: collapsible sections (the current one open by
 * default), each with flat items and/or labelled sub-section groups. Built pages
 * link; `soon` pages show greyed so the shape of the manual stays legible.
 */
export function Sidebar ({ currentPath, onNavigate }: { currentPath: string, onNavigate?: () => void }): JSX.Element {
  return (
    <nav className='doc-sidebar' aria-label='Documentation'>
      {DOC_NAV.map((section) => (
        <Section key={section.title} section={section} currentPath={currentPath} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}

/** Drops a trailing slash except on the root, so `/a/b` and `/a/b/` compare equal. */
function normalizePath (p: string): string {
  return p.length > 1 ? p.replace(/\/+$/, '') : p
}

/**
 * The current pathname, reactive across SPA navigations and safe during SSG.
 *
 * It reads the same source that makes a refresh highlight correctly: the actual
 * navigated pathname (from the router's ROUTED event) and `window.location` for
 * back/forward. Deriving from the URL rather than `route.path` keeps a click in
 * lockstep with a refresh, so the sidebar item selects and its section opens.
 */
export function useCurrentPath (): string {
  const router = useRouter()

  const readLocation = (): string => {
    if (typeof window !== 'undefined') return normalizePath(window.location.pathname)
    const p = (router?.getCurrentRoute?.() as { path?: string } | undefined)?.path
    return typeof p === 'string' ? normalizePath(p) : ''
  }

  const [path, setPath] = useState(readLocation)

  useEffect(() => {
    const onRouted = (event: { get?: (k: string) => any }): void => {
      const incoming = event?.get?.('event')
      const p = incoming?.decodedPathname ?? incoming?.pathname
      setPath(typeof p === 'string' ? normalizePath(p) : readLocation())
    }
    const onPop = (): void => setPath(readLocation())
    router?.on?.(RouteEvent.ROUTED, onRouted)
    window.addEventListener('popstate', onPop)
    setPath(readLocation()) // resync if a navigation landed between render and effect
    return () => {
      router?.off?.(RouteEvent.ROUTED, onRouted)
      window.removeEventListener('popstate', onPop)
    }
  }, [router])

  return path
}
