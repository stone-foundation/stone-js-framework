import { JSX, useEffect, useState } from 'react'

interface Entry { id: string, text: string, level: 2 | 3 }

/**
 * The "On this page" table of contents. It reads the rendered headings from the
 * article after mount (so it always matches the real content) and highlights the
 * section currently in view. Hidden when the page has no sub-headings.
 */
export function Toc (): JSX.Element | null {
  const [entries, setEntries] = useState<Entry[]>([])
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const article = document.querySelector('.doc-article')
    if (article === null) return
    const heads = Array.from(article.querySelectorAll('h2[id], h3[id]')) as HTMLElement[]
    const found: Entry[] = heads.map((h) => ({
      id: h.id,
      text: h.textContent?.replace(/^#/, '') ?? '',
      level: h.tagName === 'H3' ? 3 : 2
    }))
    setEntries(found)
    if (found.length === 0) return

    const spy = new IntersectionObserver((items) => {
      items.forEach((item) => { if (item.isIntersecting) setActive((item.target as HTMLElement).id) })
    }, { rootMargin: '0px 0px -70% 0px', threshold: 0 })
    heads.forEach((h) => spy.observe(h))
    return () => spy.disconnect()
  }, [])

  if (entries.length === 0) return null

  return (
    <nav className='toc' aria-label='On this page'>
      <p className='toc-title'>On this page</p>
      <ul>
        {entries.map((e) => (
          <li key={e.id} className={`toc-l${e.level} ${active === e.id ? 'active' : ''}`}>
            <a href={`#${e.id}`}>{e.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
