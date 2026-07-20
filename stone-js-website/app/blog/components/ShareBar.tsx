import { JSX, useState } from 'react'
import { SITE_URL } from '../../site'

/**
 * Social share bar for an article: X, LinkedIn, Hacker News, Reddit, a copy-link
 * button, and the native Web Share sheet on mobile. Builds absolute URLs from the
 * site origin so shared links resolve off-site.
 */
export function ShareBar ({ slug, title }: { slug: string, title: string }): JSX.Element {
  const [copied, setCopied] = useState(false)
  const url = `${SITE_URL}/blog/${slug}`
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)

  const links = [
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: 'Hacker News', href: `https://news.ycombinator.com/submitlink?u=${u}&t=${t}` },
    { name: 'Reddit', href: `https://www.reddit.com/submit?url=${u}&title=${t}` }
  ]

  const copy = (): void => {
    const done = (): void => { setCopied(true); setTimeout(() => setCopied(false), 1600) }
    if (navigator.clipboard?.writeText !== undefined) void navigator.clipboard.writeText(url).then(done, () => {})
    else done()
  }

  const nativeShare = (): void => {
    if (typeof navigator !== 'undefined' && navigator.share !== undefined) {
      void navigator.share({ title, url }).catch(() => {})
    } else {
      copy()
    }
  }

  return (
    <div className='sharebar' aria-label='Share this article'>
      <span className='sharebar-label'>Share</span>
      {links.map((l) => (
        <a key={l.name} className='sharebar-btn' href={l.href} target='_blank' rel='noopener noreferrer'>{l.name}</a>
      ))}
      <button className='sharebar-btn' onClick={copy}>{copied ? 'Copied' : 'Copy link'}</button>
      <button className='sharebar-btn sharebar-native' onClick={nativeShare} aria-label='Share'>Share…</button>
    </div>
  )
}
