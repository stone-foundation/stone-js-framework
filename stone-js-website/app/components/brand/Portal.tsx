import { JSX } from 'react'

/** The keystone arc, shared by the visible stroke and (when glowing) its blur twin. */
const KEY_D = 'M 22 26.1 A 34 34 0 0 1 74 26.1'

/**
 * Le Portail: the Stone.js emblem. A ring in three segments; the keystone at the
 * zenith carries the Braise gradient. Construction rules come from the brand charter.
 *
 * When `keyClassName` is set (the hero nucleus), the keystone gets a glow. The glow
 * is an SVG-native blur on a hidden solid twin behind the sharp gradient stroke, not
 * a CSS `filter: drop-shadow`. CSS drop-shadow on a gradient-painted, `zoom`-scaled
 * SVG paints a faint rectangle in some engines; an in-SVG blur on a solid path never
 * does. The pulse then animates the twin's opacity (see `.nucleus .key`), so no CSS
 * filter is involved anywhere in the atom.
 *
 * @param size - Rendered size in px.
 * @param id - Unique id base (required when several portals coexist on a page).
 * @param className - Extra class on the svg (e.g. `nucleus`).
 * @param keyClassName - Class on the keystone glow twin (e.g. `key`); enables the glow.
 */
export function Portal ({ size = 30, id = 'bz', className, keyClassName }: {
  size?: number
  id?: string
  className?: string
  keyClassName?: string
}): JSX.Element {
  const glowId = `${id}-glow`
  return (
    <svg width={size} height={size} viewBox='0 0 96 96' className={className} aria-hidden='true'>
      <defs>
        <linearGradient id={id} gradientUnits='userSpaceOnUse' x1='22' y1='14' x2='74' y2='26.1'>
          <stop offset='0' stopColor='#FFC46B' />
          <stop offset='1' stopColor='#FF5A1F' />
        </linearGradient>
        {keyClassName !== undefined && (
          <filter id={glowId} x='-70%' y='-70%' width='240%' height='240%'>
            <feGaussianBlur stdDeviation='3.4' />
          </filter>
        )}
      </defs>
      <path d='M 79.96 36.4 A 34 34 0 0 1 53.9 81.5' fill='none' stroke='var(--encre)' strokeWidth='11' strokeLinecap='round' opacity='.85' />
      <path d='M 42.1 81.5 A 34 34 0 0 1 16.05 36.4' fill='none' stroke='var(--encre)' strokeWidth='11' strokeLinecap='round' opacity='.85' />
      {keyClassName !== undefined && (
        <path className={keyClassName} d={KEY_D} fill='none' stroke='#FF6B2B' strokeWidth='11' strokeLinecap='round' filter={`url(#${glowId})`} />
      )}
      <path d={KEY_D} fill='none' stroke={`url(#${id})`} strokeWidth='11' strokeLinecap='round' />
    </svg>
  )
}
