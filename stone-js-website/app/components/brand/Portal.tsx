import { JSX } from 'react'

/**
 * Le Portail: the Stone.js emblem. A ring in three segments; the keystone at the
 * zenith carries the Braise gradient. Construction rules come from the brand charter.
 *
 * @param size - Rendered size in px.
 * @param id - Unique gradient id (required when several portals coexist on a page).
 * @param className - Extra class on the svg (e.g. `nucleus`).
 * @param keyClassName - Extra class on the keystone path (e.g. `key` for glow effects).
 */
export function Portal ({ size = 30, id = 'bz', className, keyClassName }: {
  size?: number
  id?: string
  className?: string
  keyClassName?: string
}): JSX.Element {
  return (
    <svg width={size} height={size} viewBox='0 0 96 96' className={className} aria-hidden='true'>
      <defs>
        <linearGradient id={id} x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#FFC46B' />
          <stop offset='1' stopColor='#FF5A1F' />
        </linearGradient>
      </defs>
      <path d='M 79.96 36.4 A 34 34 0 0 1 53.9 81.5' fill='none' stroke='var(--encre)' strokeWidth='11' strokeLinecap='round' opacity='.85' />
      <path d='M 42.1 81.5 A 34 34 0 0 1 16.05 36.4' fill='none' stroke='var(--encre)' strokeWidth='11' strokeLinecap='round' opacity='.85' />
      <path className={keyClassName} d='M 22 26.1 A 34 34 0 0 1 74 26.1' fill='none' stroke={`url(#${id})`} strokeWidth='11' strokeLinecap='round' />
    </svg>
  )
}
