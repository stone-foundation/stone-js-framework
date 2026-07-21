import { JSX, ReactNode, RefObject, useEffect, useRef } from 'react'

/**
 * Scroll-reveal wrapper: fades its content in when it enters the viewport.
 * Respects prefers-reduced-motion (content shows immediately). Renders an anchor
 * when `href` is provided (so a revealed card can be a link), a `div` otherwise.
 */
export function Reveal ({ children, className = '', href }: { children: ReactNode, className?: string, href?: string }): JSX.Element {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el === null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('in')
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { el.classList.add('in'); io.unobserve(el) }
      })
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const cls = `reveal ${className}`
  return href !== undefined
    ? <a ref={ref as RefObject<HTMLAnchorElement>} className={cls} href={href}>{children}</a>
    : <div ref={ref as RefObject<HTMLDivElement>} className={cls}>{children}</div>
}
