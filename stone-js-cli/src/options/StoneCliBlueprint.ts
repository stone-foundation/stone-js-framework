import { BuilderConfig, builder } from './BuilderConfig'
import { ConsoleErrorHandler } from '../ConsoleErrorHandler'
import { CreateAppConfig, createApp } from './CreateAppConfig'
import { NODE_CONSOLE_PLATFORM } from '@stone-js/node-cli-adapter'
import { EnsureStoneProjectHook } from '../EnsureStoneProjectHook'
import { metaCLIBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { AppConfig, IncomingEvent, OutgoingResponse, StoneBlueprint } from '@stone-js/core'

/**
 * App Config configuration for the Stone CLI application.
 */
export interface StoneCliAppConfig extends Partial<AppConfig<IncomingEvent, OutgoingResponse>> {
  /**
   * Stone application builder configuration.
   */
  builder: BuilderConfig

  /**
   * Create app configuration
   */
  createApp: CreateAppConfig
}

/**
 * Blueprint configuration for the Stone CLI application.
 */
export interface StoneCliBlueprint extends StoneBlueprint {
  stone: StoneCliAppConfig
}

/**
 * Default blueprint configuration for the Stone CLI.
 */
export const stoneCliBlueprint: StoneCliBlueprint = {
  stone: {
    builder,
    createApp,
    adapter: {
      platform: NODE_CONSOLE_PLATFORM
    },
    blueprint: {
      middleware: metaCLIBlueprintMiddleware
    },
    kernel: {
      errorHandlers: {
        CliError: { module: ConsoleErrorHandler, isClass: true }
      }
    },
    lifecycleHooks: {
      onExecutingEventHandler: [EnsureStoneProjectHook]
    }
  }
}
