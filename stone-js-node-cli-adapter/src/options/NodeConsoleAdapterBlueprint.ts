import { MetaCommandHandler } from '../declarations'
import { NODE_CONSOLE_PLATFORM } from '../constants'
import { nodeCliAdapterResolver } from '../resolvers'
import { NodeCliErrorHandler } from '../NodeCliErrorHandler'
import { CommandServiceProvider } from '../command/CommandServiceProvider'
import { MetaRawResponseMiddleware } from '../middleware/RawResponseMiddleware'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { AdapterConfig, AppConfig, defaultKernelResolver, StoneBlueprint } from '@stone-js/core'

/**
 * Configuration interface for the Node Cli Adapter.
 *
 * Extends the `AdapterConfig` interface from the Stone.js framework and provides
 * customizable options specific to the Node Cli platform. This includes
 * alias, resolver, middleware, hooks, and various adapter state flags.
 */
export interface NodeConsoleAdapterAdapterConfig extends AdapterConfig {
  /**
   * The commands that the Node Cli adapter will handle.
   */
  commands: MetaCommandHandler[]
}

/**
 * Represents the NodeCli configuration options for the application.
 */
export interface NodeConsoleAdapterConfig extends Partial<AppConfig> {
  adapter?: Partial<NodeConsoleAdapterAdapterConfig>
  adapters: NodeConsoleAdapterAdapterConfig[]
}

/**
 * Blueprint interface for the Node Cli Adapter.
 *
 * This interface extends `StoneBlueprint` and defines the structure of the
 * Node Cli adapter blueprint used in the Stone.js framework. It includes
 * a `stone` object with an array of `NodeCliAdapterConfig` items.
 */
export interface NodeConsoleAdapterBlueprint extends StoneBlueprint {
  stone: Partial<NodeConsoleAdapterConfig>
}

/**
 * Default blueprint configuration for the Node Cli Adapter.
 *
 * This blueprint defines the initial configuration for the Node Cli adapter
 * within the Stone.js framework. It includes:
 * - An alias for the Node Cli platform (`Node_CLI_PLATFORM`).
 * - A default resolver function (currently a placeholder).
 * - Middleware, hooks, and state flags (`current`, `default`, `preferred`).
 */
export const nodeConsoleAdapterBlueprint: NodeConsoleAdapterBlueprint = {
  stone: {
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    providers: [
      CommandServiceProvider
    ],
    adapters: [
      {
        commands: [],
        current: false,
        default: false,
        variant: 'console',
        platform: NODE_CONSOLE_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware,
          MetaRawResponseMiddleware
        ],
        resolver: nodeCliAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: NodeCliErrorHandler, isClass: true }
        }
      }
    ]
  }
}
