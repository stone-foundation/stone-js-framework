import { useEffect } from 'react'

/**
 * Scrolls to the element named by a `#hash`, smoothly when asked. Returns whether
 * a matching element was found, so callers can decide to keep the click default.
 */
export function scrollToHash (hash: string, smooth = true): boolean {
  const id = hash.replace(/^#/, '')
  if (id === '') return false
  const el = document.getElementById(id)
  if (el === null) return false
  el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  return true
}

/**
 * Makes in-page anchors work in every case: a fresh load or refresh at `/#id`, a
 * client navigation that lands with a hash, and later `hashchange` events. On load
 * it retries across a few frames, because Reveal-animated sections and the router
 * can mount the target slightly after first paint. Renders nothing.
 */
export function ScrollToHash (): null {
  useEffect(() => {
    if (window.location.hash !== '') {
      let tries = 0
      const tick = (): void => {
        if (scrollToHash(window.location.hash, false) || tries++ > 24) return
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    const onHash = (): void => { scrollToHash(window.location.hash, true) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return null
}
