import { isNotEmpty } from '@stone-js/core'
import { STONE_PAGE_EVENT_OUTLET } from '../constants'
import { ReactNode, useEffect, useState, FunctionComponent, HTMLAttributes } from 'react'

/**
 * Stone Outlet options.
 */
export interface StoneOutletOptions extends HTMLAttributes<HTMLDivElement> {}

/**
 * A dynamic rendering component that updates its content based on a global event.
 *
 * - Listens for `stone:inject:react-page:outlet` and updates its view when triggered.
 * - Uses `useState` to manage the currently displayed content.
 * - Automatically cleans up event listeners on unmount.
 *
 * This component enables dynamic content updates within a Stone.js application.
 *
 * @param options - The options to create the Stone Outlet.
 * @returns The Stone Outlet component.
 */
export const StoneOutlet: FunctionComponent<StoneOutletOptions> = ({ children, ...rest }) => {
  const [currentView, setCurrentView] = useState<ReactNode>(children)

  useEffect(() => {
    const eventName = STONE_PAGE_EVENT_OUTLET
    const handleEvent = (e: Event): void => {
      if (isNotEmpty<CustomEvent>(e) && isNotEmpty<ReactNode>(e.detail)) {
        setCurrentView(e.detail)
      }
    }

    window.addEventListener(eventName, handleEvent)

    return () => window.removeEventListener(eventName, handleEvent)
  }, [])

  return <div {...rest} data-stone-outlet='true'>{currentView}</div>
}
