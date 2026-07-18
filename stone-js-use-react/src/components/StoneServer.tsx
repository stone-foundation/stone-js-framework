import { isServer } from '../UseReactPageInternals'
import { FunctionComponent, ReactNode } from 'react'

/**
 * Stone Server options.
 */
interface StoneServerOptions {
  children: ReactNode
}

/**
 * Stone Server.
 * This component is used to wrap content
 * that should only be rendered on the server.
 *
 * @param options - The options to create the Stone Server.
 */
export const StoneServer: FunctionComponent<StoneServerOptions> = ({ children }) => {
  return isServer() ? <>{children}</> : <></>
}
