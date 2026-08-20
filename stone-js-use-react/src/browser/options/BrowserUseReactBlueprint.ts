import { metaBrowserUseReactBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { internalUseReactBlueprint } from '../../options/UseReactBlueprint'
import { UseReactBlueprint } from '@stone-js/use-react-core'

/**
 * Middleware for the React blueprint.
 */
internalUseReactBlueprint.stone.blueprint = { middleware: metaBrowserUseReactBlueprintMiddleware }

/**
 * Default blueprint for a React-based Stone.js application.
 *
 * - Defines middleware, lifecycle hooks, and the default HTML template path.
 */
export const useReactBlueprint: UseReactBlueprint = internalUseReactBlueprint
