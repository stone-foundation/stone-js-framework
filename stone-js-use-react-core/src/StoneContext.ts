import { createContext, type Context } from 'react'
import { StoneContextType } from './declarations'

/**
 * Stone context.
 * Usefull to pass data to the components.
 */
export const StoneContext: Context<StoneContextType> = createContext<StoneContextType>({} as any)
