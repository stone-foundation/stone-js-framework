import { locate } from '../nav'
import { JSX } from 'react'
import { StoneLink } from '@stone-js/use-react'

/**
 * The trail to the current page: Docs › Section › (Group ›) Page. Derived from
 * the nav tree, so it stays correct as the manual grows. Renders nothing for
 * paths not in the tree.
 */
export function Breadcrumbs ({ path }: { path: string }): JSX.Element | null {
  const here = locate(path)
  if (here === undefined) return null

  const crumbs: string[] = [here.section.title]
  if (here.group !== undefined) crumbs.push(here.group.title)

  return (
    <nav className='crumbs' aria-label='Breadcrumb'>
      <StoneLink to='/docs'>Docs</StoneLink>
      {crumbs.map((label) => (<span key={label}><span className='crumb-sep'>›</span>{label}</span>))}
      <span className='crumb-sep'>›</span><span className='crumb-here'>{here.link.title}</span>
    </nav>
  )
}
