import './PullToRefresh.css'
import { FC, ReactNode, TouchEvent, useRef, useState } from 'react'

/**
 * PullToRefresh options.
 */
export interface PullToRefreshOptions {
  children: ReactNode
  threshold?: number
  onRefresh: () => Promise<void> | void
}

/**
 * Lightweight, SSR-safe pull-to-refresh wrapper.
 *
 * Implemented in-app (with no dependency that touches `window` at import time)
 * so it renders safely during server-side rendering and static route
 * generation. The pull gesture is a progressive enhancement that only activates
 * from touch interactions on the client.
 */
export const PullToRefresh: FC<PullToRefreshOptions> = ({ children, onRefresh, threshold = 64 }) => {
  const startY = useRef<number | null>(null)
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const onTouchStart = (event: TouchEvent): void => {
    if (refreshing) { return }
    // Only start a pull when the page is scrolled to the very top.
    if (document.documentElement.scrollTop <= 0) {
      startY.current = event.touches[0].clientY
    }
  }

  const onTouchMove = (event: TouchEvent): void => {
    if (startY.current === null || refreshing) { return }
    const delta = event.touches[0].clientY - startY.current
    if (delta > 0) { setPullY(Math.min(delta, threshold * 1.5)) }
  }

  const onTouchEnd = (): void => {
    if (startY.current === null) { return }
    const shouldRefresh = pullY >= threshold
    startY.current = null
    setPullY(0)
    if (shouldRefresh) {
      setRefreshing(true)
      void Promise.resolve(onRefresh()).finally(() => setRefreshing(false))
    }
  }

  return (
    <div
      className='pull-to-refresh'
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform: pullY > 0 ? `translateY(${pullY}px)` : undefined,
        transition: pullY > 0 ? 'none' : 'transform .2s ease'
      }}
    >
      {refreshing && <div className='pull-to-refresh__indicator'>Refreshing…</div>}
      {children}
    </div>
  )
}
