import { useColorScheme } from 'react-native'

/**
 * The Stone.js brand, "Obsidienne & Braise", as values a StyleSheet can use.
 *
 * The same palette the web starters paint in CSS custom properties. A native application has no
 * cascade, so the tokens are plain values and the screen reads them through `useStoneTheme`.
 */
export interface StoneTheme {
  /** The page ground. */
  ink: string
  /** The glow at the top of the ground, behind the mark. */
  inkGlow: string
  /** Primary text. */
  cream: string
  /** Secondary text. */
  creamDim: string
  /** The ember gradient, light end. Also the accent for small text. */
  ember1: string
  /** The ember gradient, dark end. */
  ember2: string
  /** Hairlines and card borders. */
  line: string
  /** Card and pill surfaces. */
  card: string
  /** The mark's two arcs. */
  mark: string
}

const dark: StoneTheme = {
  ink: '#14110F',
  inkGlow: '#241C17',
  cream: '#F4EFE6',
  creamDim: '#A69A8C',
  ember1: '#FFC46B',
  ember2: '#FF5A1F',
  line: 'rgba(244, 239, 230, 0.10)',
  card: 'rgba(244, 239, 230, 0.05)',
  mark: '#E2D9CC'
}

const light: StoneTheme = {
  ink: '#F4EFE6',
  inkGlow: '#FFFFFF',
  cream: '#1B1613',
  creamDim: '#6B6154',
  // On a light ground the ember needs the darker end to stay readable, per the brand's
  // contrast notes: `braise.clair` for large elements, `braise.texte` for small text.
  ember1: '#E04E10',
  ember2: '#A83A08',
  line: 'rgba(27, 22, 19, 0.12)',
  card: 'rgba(27, 22, 19, 0.04)',
  mark: '#1B1613'
}

/**
 * The palette matching the device's appearance.
 *
 * Dark is the default, as in the web starters: `useColorScheme` returns `null` when the platform
 * expresses no preference, and the brand's ground is obsidian.
 *
 * @returns The active theme.
 */
export function useStoneTheme (): StoneTheme {
  return useColorScheme() === 'light' ? light : dark
}
