import { ALGOLIA } from '../../site'
import { JSX, useEffect, useRef } from 'react'

/** Loads the vendored DocSearch stylesheet once (kept out of the JS bundle so the SSR build never sees a CSS import). */
function ensureStyles (): void {
  if (document.getElementById('docsearch-css') !== null) return
  const link = document.createElement('link')
  link.id = 'docsearch-css'
  link.rel = 'stylesheet'
  link.href = '/vendor/docsearch.css'
  document.head.appendChild(link)
}

/**
 * Docs search, powered by Algolia DocSearch. The runtime and its stylesheet load
 * on the client only (dynamic import), so server-side rendering stays untouched;
 * DocSearch injects its own button (and the Cmd/Ctrl+K modal) into the host.
 * Navigation is routed through the client so results open without a full reload.
 */
export function Search (): JSX.Element {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    ensureStyles()
    void import('@docsearch/js').then((mod) => {
      if (!active || host.current === null) return
      mod.default({
        container: host.current,
        appId: ALGOLIA.appId,
        apiKey: ALGOLIA.apiKey,
        indexName: ALGOLIA.indexName,
        placeholder: 'Search the docs',
        // Keep results inside the SPA: same-origin links navigate without a reload.
        navigator: {
          navigate ({ itemUrl }) {
            try {
              const url = new URL(itemUrl, window.location.origin)
              if (url.origin === window.location.origin) {
                window.history.pushState(null, '', url.pathname + url.hash)
                window.dispatchEvent(new PopStateEvent('popstate'))
                return
              }
            } catch {}
            window.location.assign(itemUrl)
          }
        }
      })
    })
    return () => { active = false }
  }, [])

  return <div ref={host} className='docsearch-host' />
}
