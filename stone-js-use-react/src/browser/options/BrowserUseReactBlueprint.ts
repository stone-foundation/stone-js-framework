import { metaBrowserUseReactBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { internalUseReactBlueprint, UseReactBlueprint } from '../../options/UseReactBlueprint'

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
