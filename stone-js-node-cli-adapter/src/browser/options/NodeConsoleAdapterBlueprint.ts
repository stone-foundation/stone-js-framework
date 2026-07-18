import { NodeConsoleAdapterBlueprint } from '../../options/NodeConsoleAdapterBlueprint'

/**
 * Default blueprint configuration for the Node Cli Adapter.
 *
 * This blueprint defines the initial configuration for the Node Cli adapter
 * within the Stone.js framework. It includes:
 * - An alias for the Node Cli platform (`Node_CLI_PLATFORM`).
 * - A default resolver function (currently a placeholder).
 * - Middleware, hooks, and state flags (`current`, `default`, `preferred`).
 */
export const nodeConsoleAdapterBlueprint: NodeConsoleAdapterBlueprint = { stone: { adapters: [] } }
