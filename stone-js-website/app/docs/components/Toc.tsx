import { scrollToId } from './content'
import { JSX, useEffect, useState } from 'react'

interface Entry { id: string, text: string, level: 2 | 3 }

/**
 * The "On this page" table of contents. It reads the rendered headings from the
 * article and highlights the section in view. It re-scans whenever the route
 * changes (the layout keeps this component mounted across page navigations, so a
 * one-time scan would go stale), and clicks scroll smoothly.
 */
export function Toc ({ pathKey }: { pathKey: string }): JSX.Element | null {
  const [entries, setEntries] = useState<Entry[]>([])
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    // Wait a tick so the new page's article is in the DOM after a route change.
    const raf = requestAnimationFrame(() => {
      const article = document.querySelector('.doc-article')
      if (article === null) { setEntries([]); return }
      const heads = Array.from(article.querySelectorAll('h2[id], h3[id]')) as HTMLElement[]
      const found: Entry[] = heads.map((h) => ({
        id: h.id,
        text: h.textContent?.replace(/^#/, '') ?? '',
        level: h.tagName === 'H3' ? 3 : 2
      }))
      setEntries(found)
      setActive(found[0]?.id ?? '')
      if (found.length === 0) return

      const spy = new IntersectionObserver((items) => {
        items.forEach((item) => { if (item.isIntersecting) setActive((item.target as HTMLElement).id) })
      }, { rootMargin: '0px 0px -70% 0px', threshold: 0 })
      heads.forEach((h) => spy.observe(h))
      ;(article as any).__tocSpy = spy
    })

    return () => {
      cancelAnimationFrame(raf)
      const article = document.querySelector('.doc-article') as any
      article?.__tocSpy?.disconnect?.()
    }
  }, [pathKey])

  if (entries.length === 0) return null

  return (
    <nav className='toc' aria-label='On this page'>
      <p className='toc-title'>On this page</p>
      <ul>
        {entries.map((e) => (
          <li key={e.id} className={`toc-l${e.level} ${active === e.id ? 'active' : ''}`}>
            <a href={`#${e.id}`} onClick={(ev) => scrollToId(ev, e.id)}>{e.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
