import { JSX, useEffect, useState } from 'react'
import { GITHUB_URL } from '../site'

const DISMISS_KEY = 'stone-beta-dismissed'
const FEEDBACK_URL = `${GITHUB_URL}/stone-js-framework/discussions`

/**
 * The public-beta announcement bar.
 *
 * Rendered on the server AND on the first client render (so hydration matches), then hidden by an
 * effect if the visitor already dismissed it — never read `localStorage` during render, or SSR and
 * the client disagree. Sits above the header on every shell (site + docs).
 */
export function BetaBanner (): JSX.Element | null {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try { if (localStorage.getItem(DISMISS_KEY) === '1') setDismissed(true) } catch {}
  }, [])

  if (dismissed) { return null }

  const dismiss = (): void => {
    setDismissed(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  return (
    <aside className='beta-banner' role='region' aria-label='Public beta'>
      <div className='beta-inner'>
        <span className='beta-tag'>Beta</span>
        <p className='beta-msg'>
          <strong>Stone.js is in public beta.</strong> One framework for backend and frontend,
          written once and deployed anywhere. Build something real, then tell us what breaks: your
          feedback shapes 1.0.
        </p>
        <a className='beta-cta' href={FEEDBACK_URL} target='_blank' rel='noopener noreferrer'>
          Share feedback <span aria-hidden='true'>↗</span>
        </a>
        <button className='beta-close' type='button' onClick={dismiss} aria-label='Dismiss the beta banner'>
          <span aria-hidden='true'>×</span>
        </button>
      </div>
    </aside>
  )
}
