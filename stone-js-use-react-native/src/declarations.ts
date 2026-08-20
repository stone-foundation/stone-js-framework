import { ReactNode } from 'react'
import { HeadContext } from '@stone-js/use-view'

/**
 * What the renderer produces for one resolved route.
 *
 * The native counterpart of the web renderer's browser content. There is no `ssr` flag and
 * no `fullRender`: a native application always renders on the device, and the only question
 * is where the result goes in the navigation stack.
 */
export interface NativeResponseContent {
  /** The page wrapped in its layout and view providers. */
  app?: ReactNode

  /** The page alone, for a navigator that supplies its own chrome. */
  component?: ReactNode

  /** The layout name the page asked for. */
  layout?: string

  /** The resolved head. On a phone, its `title` is the screen title. */
  head?: HeadContext

  /** The path this content answers, carried so a navigator can key screens by route. */
  path?: string
}

/**
 * How a resolved route enters the stack.
 *
 * - `push`: a new screen on top, the default, and what gives a back gesture something to
 *   go back to.
 * - `replace`: swap the current screen, for a redirect or a `navigate(..., true)`.
 * - `reset`: clear the stack and start again, for a sign-out or a deep link that should not
 *   leave a history behind it.
 */
export type ScreenTransition = 'push' | 'replace' | 'reset'

/**
 * One screen in the stack.
 */
export interface NativeScreen {
  /** Stable identity, so a navigator can keep a screen's state across renders. */
  key: string

  /** The path this screen answers. */
  path: string

  /** What to display. */
  element: ReactNode

  /** The screen title, from the page's head. */
  title?: string
}

/**
 * A listener notified whenever the stack changes.
 */
export type ScreenStackListener = (screens: NativeScreen[]) => void
