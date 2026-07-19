import { JSX, useEffect, useRef, useState } from 'react'

interface Hit { url: string, title: string, excerpt: string }

/** Loads the Pagefind runtime once, from the deployed /pagefind bundle. */
let pagefindPromise: Promise<any> | null = null
async function loadPagefind (): Promise<any> {
  if (pagefindPromise === null) {
    const base = (import.meta as any).env?.BASE_URL ?? '/'
    const url = `${base}pagefind/pagefind.js`.replace(/\/\//g, '/')
    // @vite-ignore: this file exists only in the built site, never in the bundle.
    pagefindPromise = import(/* @vite-ignore */ url).then(async (pf) => {
      await pf.options?.({ excerptLength: 24 })
      return pf
    })
  }
  return await pagefindPromise
}

/**
 * The docs search: a trigger in the header plus a Cmd/Ctrl+K modal. Results come
 * from Pagefind, which indexes the built HTML after the SSG build. Degrades
 * gracefully when the index is absent (e.g. the dev server).
 */
export function Search (): JSX.Element {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [state, setState] = useState<'idle' | 'searching' | 'unavailable'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  // Global Cmd/Ctrl+K to open, Esc to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])

  // Debounced query against Pagefind.
  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (q === '') { setHits([]); setState('idle'); return }
    let cancelled = false
    const timer = setTimeout(() => {
      setState('searching')
      loadPagefind()
        .then(async (pf) => {
          const search = await pf.search(q)
          const data = await Promise.all(search.results.slice(0, 8).map(async (r: any) => await r.data()))
          if (cancelled) return
          setHits(data.map((d: any) => ({ url: d.url, title: d.meta?.title ?? d.url, excerpt: d.excerpt })))
          setState('idle')
        })
        .catch(() => { if (!cancelled) setState('unavailable') })
    }, 160)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [query, open])

  return (
    <>
      <button className='search-trigger' onClick={() => setOpen(true)} aria-label='Search'>
        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='11' cy='11' r='7' /><path d='m21 21-4.3-4.3' /></svg>
        <span className='st-label'>Search</span>
        <kbd className='st-kbd'>⌘K</kbd>
      </button>

      {open && (
        <div className='search-overlay' onClick={() => setOpen(false)} role='dialog' aria-modal='true' aria-label='Search'>
          <div className='search-panel' onClick={(e) => e.stopPropagation()}>
            <div className='search-field'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='11' cy='11' r='7' /><path d='m21 21-4.3-4.3' /></svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search the docs'
                aria-label='Search the docs'
              />
              <kbd className='st-kbd'>Esc</kbd>
            </div>
            <div className='search-results'>
              {state === 'unavailable' && <p className='search-note'>Search is available on the deployed site. Run a static preview of the build to try it locally.</p>}
              {state === 'idle' && query.trim() !== '' && hits.length === 0 && <p className='search-note'>No results for "{query}".</p>}
              {hits.map((h) => (
                <a key={h.url} className='search-hit' href={h.url}>
                  <span className='sh-title'>{h.title}</span>
                  <span className='sh-excerpt' dangerouslySetInnerHTML={{ __html: h.excerpt }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
