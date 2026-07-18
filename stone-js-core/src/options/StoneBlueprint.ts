import {
  IBlueprint,
  MetaService,
  LifecycleHookType,
  MetaEventListener,
  MixedConfiguration,
  MixedEventSubscriber,
  MixedServiceProvider
} from '../declarations'
import { MixedPipe } from '@stone-js/pipeline'
import { LoggerConfig, logger } from './LoggerConfig'
import { KernelConfig, kernel } from './KernelConfig'
import { IncomingEvent } from '../events/IncomingEvent'
import { AdapterConfig, adapters } from './AdapterConfig'
import { OutgoingResponse } from '../events/OutgoingResponse'
import { BlueprintConfig, blueprint } from './BlueprintConfig'
import { CoreServiceProvider } from '../providers/CoreServiceProvider'

/**
 * Environment settings.
 */
export enum Environment {
  Test = 'test',
  Production = 'production',
  Development = 'development',
}

/**
 * Application settings.
 *
 * This interface defines the main configuration settings for the Stone.js application,
 * including general application information, environment settings, adapter configurations,
 * middleware options, logging settings, and service registration.
 */
export interface AppConfig<U extends IncomingEvent = IncomingEvent, V extends OutgoingResponse = OutgoingResponse> {
  /**
   * The name of the application.
   */
  name: string

  /**
   * The current environment in which the application is running.
   * Possible values are development, production, and test.
   */
  env: Environment

  /**
   * Determines if the application is in debug mode.
   * When enabled, detailed error messages with stack traces will be shown.
   */
  debug: boolean

  /**
   * The default timezone for the application.
   */
  timezone: string

  /**
   * The default locale for the application.
   */
  locale: string

  /**
   * The fallback locale used when a translation for the default locale is unavailable.
   */
  fallback_locale: string

  /**
   * A secret key used for encryption purposes throughout the application.
   * This key should be kept secure.
   */
  secret?: string

  /**
   * Configuration options for building the application blueprint, including middleware and pipe priorities.
   */
  blueprint: BlueprintConfig<IBlueprint, any>

  /**
   * Current Adapter configurations for the application.
   * This key allow you to specify the current adapter with the alias key.
   */
  adapter?: Partial<AdapterConfig<any, any, any, U, any, V>>

  /**
   * Adapter configurations for the application.
   * List of all adapters used in the application.
   */
  adapters: Array<AdapterConfig<any, any, any, U, any, V>>

  /**
   * Kernel configurations for the application.
   */
  kernel: KernelConfig<U, V>

  /**
   * Logging settings, including the logger instance and error reporting configurations.
   */
  logger: LoggerConfig

  /**
   * Middleware configuration options for specific stages of the application lifecycle.
   */
  middleware?: Array<MixedPipe<U, V>>

  /**
   * Services to be automatically registered when the application starts.
   */
  services: MetaService[]

  /**
   * Event listeners to be automatically registered when the application starts.
   * This allows you to specify functions to listen for specific events.
   */
  listeners: Array<MetaEventListener<any>>

  /**
   * Subscribers to be automatically registered when the application starts.
   * Subscribers are used for handling and responding to events.
   */
  subscribers: MixedEventSubscriber[]

  /**
   * Service providers to be automatically loaded for each request to the application.
   */
  providers: MixedServiceProvider[]

  /**
   * Class aliases to be registered when the application starts.
   * These aliases provide shorthand references to commonly used classes.
   */
  aliases: Record<string, any>

  /**
   * Lifecycle hooks for the application.
   * These hooks allow you to run custom code at different stages of the application lifecycle.
   */
  lifecycleHooks?: LifecycleHookType<IBlueprint, any, any, U, V>

  /**
   * Live configurations are loaded at each request.
   * By default, configurations are loaded once when the application starts.
   * This is useful for defining dynamic configurations that do not require a restart to apply changes.
   */
  liveConfigurations?: MixedConfiguration[]

  /**
   * Allow adding any additional custom properties.
   * The value of the custom properties can be of any type, depending on user requirements.
   */
  [key: string]: unknown
}

/**
 * Stone blueprint.
 *
 * This interface defines the main configuration options for the Stone.js framework.
 * It includes settings for the builder, adapters, and the main application,
 * while allowing additional custom options to be added.
 */
export interface StoneBlueprint<U extends IncomingEvent = IncomingEvent, V extends OutgoingResponse = OutgoingResponse> {
  /**
   * Application-level settings, including environment, middleware, logging, and service registration.
   */
  stone: Partial<AppConfig<U, V>>

  /**
   * Allow adding any additional custom properties.
   * The value of the custom properties can be of any type, depending on user requirements.
   */
  [key: string]: unknown
}

/**
 * Stone main options.
 *
 * This object defines the main configuration options for the Stone.js framework.
 * It includes settings for middleware, adapters, application-level configurations,
 * logging, services, listeners, subscribers, providers, and aliases.
 *
 * @returns {StoneBlueprint}
 */
export const stoneBlueprint: StoneBlueprint = {
  // App namespace.
  // Here you can define application-level settings.
  stone: {
    // The name of your application.
    name: 'Stone.js',

    // The "environment" your application is currently running in (e.g., development, production).
    env: Environment.Production,

    // Whether your application is in debug mode.
    // Useful for showing detailed error messages with stack traces.
    debug: false,

    // The default timezone for your application.
    timezone: 'UTC',

    // The default locale for your application.
    locale: 'en',

    // The fallback locale for your application.
    fallback_locale: 'en',

    // Blueprint builder namespace.
    blueprint,

    // Adapters namespace.
    // Here you can define adapter settings.
    adapters,

    // Global app-level settings for all adapters.
    kernel,

    // Logging settings for all adapters.
    logger,

    // Services to be automatically registered when the application starts.
    services: [],

    // Listeners to be automatically registered when the application starts.
    listeners: [],

    // Subscribers to be automatically registered when the application starts.
    subscribers: [],

    // Service providers to be automatically loaded at each request to your application.
    providers: [
      CoreServiceProvider
    ],

    // Class aliases to be registered when the application starts.
    aliases: {}
  }
}
