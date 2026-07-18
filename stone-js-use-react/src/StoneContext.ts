import { createContext } from 'react'
import { StoneContextType } from './declarations'

/**
 * Stone context.
 * Usefull to pass data to the components.
 */
export const StoneContext = createContext<StoneContextType>({} as any)
