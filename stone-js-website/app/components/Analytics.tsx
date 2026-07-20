import { GA_MEASUREMENT_ID } from '../site'
import { JSX, useEffect } from 'react'

let loaded = false

/** Loads Google Analytics (gtag) once, on the client. */
function loadGtag (): void {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  const w = window as any
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)
  w.dataLayer = w.dataLayer ?? []
  w.gtag = function gtag () { w.dataLayer.push(arguments) }
  w.gtag('js', new Date())
  w.gtag('config', GA_MEASUREMENT_ID)
}

/** Records a page view for single-page navigations. */
export function trackPageView (path: string): void {
  const w = window as any
  if (typeof w.gtag === 'function') {
    w.gtag('event', 'page_view', { page_path: path, page_location: window.location.href })
  }
}

/**
 * Site analytics. Renders nothing; loads gtag once on mount. Drop it into every
 * shell (landing and docs) so tracking is site-wide.
 */
export function Analytics (): JSX.Element | null {
  useEffect(() => { loadGtag() }, [])
  return null
}
