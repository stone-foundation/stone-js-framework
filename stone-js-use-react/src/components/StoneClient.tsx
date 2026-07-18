import { isClient } from '../UseReactPageInternals'
import { FunctionComponent, ReactNode } from 'react'

/**
 * Stone Client options.
 */
interface StoneClientOptions {
  children: ReactNode
}

/**
 * Stone Client.
 * This component is used to wrap content
 * that should only be rendered on the client.
 *
 * @param options - The options to create the Stone Client.
 */
export const StoneClient: FunctionComponent<StoneClientOptions> = ({ children }) => {
  return isClient() ? <>{children}</> : <></>
}
