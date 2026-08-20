import { ReactNode } from 'react'
import { useScreens } from '../hooks'

/**
 * Displays whatever the framework resolved.
 *
 * The root of a native Stone.js application, and deliberately the simplest thing that works:
 * it shows the screen on top of the stack. No navigation library, no native module, nothing
 * to install, so an application runs the moment the packages are installed.
 *
 * It is not the only option, and for a shipping application it is not the best one. The stack
 * is public state (`useScreens`), so a real navigator drives itself from the same object and
 * brings what it alone can bring: the platform's transitions, the swipe-back gesture, and a
 * screen keeping its own state while another is on top. The README shows that wiring with
 * `@react-navigation/native-stack`. This component is what makes the first run work, and the
 * floor a navigator replaces.
 *
 * @param props.fallback - What to show before the first route has been resolved.
 * @returns The current screen.
 */
export function StoneNativeApp ({ fallback = null }: { fallback?: ReactNode }): ReactNode {
  const screens = useScreens()
  const current = screens[screens.length - 1]

  return current?.element ?? fallback
}
