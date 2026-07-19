import { JSX, ReactNode, useEffect, useRef } from 'react'

/**
 * Scroll-reveal wrapper: fades its content in when it enters the viewport.
 * Respects prefers-reduced-motion (content shows immediately).
 */
export function Reveal ({ children, className = '' }: { children: ReactNode, className?: string }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

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

  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}
