import { MetaReactRuntime } from '../ReactRuntime'
import { UseReactBlueprint } from '@stone-js/use-react-core'
import { MetaUseReactServiceProvider } from '../UseReactServiceProvider'
/**
 * Default blueprint for a React-based Stone.js application.
 *
 * - Defines middleware, lifecycle hooks, and the default HTML template path.
 */
export const internalUseReactBlueprint: UseReactBlueprint = {
  stone: {
    useReact: {},
    services: [MetaReactRuntime],
    providers: [MetaUseReactServiceProvider]
  }
}
