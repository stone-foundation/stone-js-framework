import { StoneContext } from '../StoneContext'
import { StoneContextType } from '../declarations'
import { FunctionComponent, ReactNode, StrictMode } from 'react'

/**
 * Stone Page options.
 */
interface StonePageOptions {
  children: ReactNode
  context: StoneContextType
}

/**
 * Provides a scoped `StoneContext` for its children within a strict mode.
 *
 * - Wraps content in `React.StrictMode` for enhanced debugging.
 * - Supplies a `StoneContext.Provider` to get access to the event, data and container.
 *
 * This component ensures that all child components have access to the provided
 * context within a Stone.js application.
 *
 * @param options - The options to create the Stone Page.
 * @returns The Stone Page component.
 */
export const StonePage: FunctionComponent<StonePageOptions> = ({ context, children }) => {
  return (
    <StrictMode>
      <StoneContext.Provider value={context}>
        {children}
      </StoneContext.Provider>
    </StrictMode>
  )
}
