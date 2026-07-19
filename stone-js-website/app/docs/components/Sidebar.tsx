import { DOC_NAV } from '../nav'
import { StoneLink, useRoute } from '@stone-js/use-react'
import { JSX } from 'react'

/**
 * The documentation sidebar: the whole course, always visible. Built pages link;
 * `soon` pages show greyed so the shape of the course is legible from day one.
 * The current page is highlighted from the active route.
 */
export function Sidebar ({ currentPath, onNavigate }: { currentPath: string, onNavigate?: () => void }): JSX.Element {
  return (
    <nav className='doc-sidebar' aria-label='Documentation'>
      {DOC_NAV.map((section) => (
        <div key={section.title} className='side-section'>
          <p className='side-title'>{section.title}</p>
          <p className='side-blurb'>{section.blurb}</p>
          <ul>
            {section.items.map((item) => (
              <li key={item.path}>
                {item.soon === true
                  ? <span className='side-link soon' aria-disabled='true'>{item.title}<span className='soon-tag'>soon</span></span>
                  : (
                    <StoneLink
                      to={item.path}
                      className={`side-link ${currentPath === item.path ? 'active' : ''}`}
                      onClick={onNavigate}
                    >
                      {item.title}
                    </StoneLink>
                    )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** Resolves the current pathname from the router, safe during SSG. */
export function useCurrentPath (): string {
  const route = useRoute()
  const fromRoute = (route as { path?: string } | undefined)?.path
  if (typeof fromRoute === 'string') return fromRoute
  if (typeof window !== 'undefined') return window.location.pathname
  return ''
}
