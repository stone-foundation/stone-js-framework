import { scrollToId } from './content'
import { JSX, useEffect, useState } from 'react'

interface Entry { id: string, text: string, level: 2 | 3 }

/**
 * The "On this page" table of contents. It reads the rendered headings from the
 * article and highlights the section in view.
 *
 * The layout keeps this component mounted across navigations, so a one-time scan
 * would go stale. Rather than trust a single post-route-change tick (the new
 * article can commit a frame later), it watches the article with a MutationObserver
 * and re-scans whenever its content actually changes. That covers client
 * navigation, refresh, and late/async renders alike.
 */
export function Toc ({ pathKey }: { pathKey: string }): JSX.Element | null {
  const [entries, setEntries] = useState<Entry[]>([])
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const article = document.querySelector('.doc-article')
    if (article === null) { setEntries([]); return }

    let spy: IntersectionObserver | null = null

    const scan = (): void => {
      const heads = Array.from(article.querySelectorAll('h2[id], h3[id]')) as HTMLElement[]
      const found: Entry[] = heads.map((h) => ({
        id: h.id,
        text: h.textContent?.replace(/^#/, '') ?? '',
        level: h.tagName === 'H3' ? 3 : 2
      }))
      setEntries(found)
      setActive((prev) => (found.some((f) => f.id === prev) ? prev : (found[0]?.id ?? '')))

      spy?.disconnect()
      if (found.length === 0) { spy = null; return }
      spy = new IntersectionObserver((items) => {
        items.forEach((item) => { if (item.isIntersecting) setActive((item.target as HTMLElement).id) })
      }, { rootMargin: '0px 0px -70% 0px', threshold: 0 })
      heads.forEach((h) => spy?.observe(h))
    }

    // Scan now, and again whenever the article subtree changes (new page mounted).
    scan()
    let raf = 0
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(scan)
    })
    mo.observe(article, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(raf)
      mo.disconnect()
      spy?.disconnect()
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
