/**
 * Represents a Promiseable type.
 */
export type Promiseable<T> = T | Promise<T>

/**
 * A string type that represents a pipe alias.
 */
export type PipeAlias = string

/**
 * A class type that represents a pipe.
 */
export type PipeClass<T = unknown, R = T, Args extends any[] = any[]> = new (...args: Args) => PipeInstance<T, R>

/**
 * A function type that represents a pipe.
 */
export type FunctionalPipe<T = unknown, R = T> = (passable: T, next: PipeExecutor<T, R>, ...params: any[]) => Promiseable<R>

/**
 * A factory function type that represents a pipe.
 */
export type FactoryPipe<T = unknown, R = T, Args extends any[] = any[]> = (...args: Args) => FunctionalPipe<T, R>

/**
 * A type that can either be a function or a string, representing a pipeline step.
 *
 * A pipe can either be a function that performs an action or a string identifier to be resolved.
 */
export type PipeType<T = unknown, R = T, Args extends any[] = any[]> = PipeAlias | PipeClass<T, R, Args> | FunctionalPipe<T, R> | FactoryPipe<T, R, Args>

/**
 * A mixed type that can be either a simple Pipe or a MetaPipe configuration.
 */
export type MixedPipe<T = unknown, R = T, Args extends any[] = any[]> = PipeType<T, R, Args> | MetaPipe<T, R, Args>

/**
 * Pipe Executor function type.
 *
 * @param passable - The passable objects being sent through the pipeline.
 * @returns The result of the execution, which could be a synchronous or asynchronous response.
 *
 * @template T - The type of the passable object.
 * @template R - The type of the return value from the pipeline execution, defaulting to `T`.
 */
export type PipeExecutor<T = unknown, R = T> = (passable: T) => Promiseable<R>

/**
 * Next Pipe Executor function type.
 *
 * @param passable - The passable objects being sent through the pipeline.
 * @returns The result of the execution, which could be a synchronous or asynchronous response.
 *
 * @template T - The type of the passable object.
 * @template R - The type of the return value from the pipeline execution, defaulting to `T`.
 */
export type NextPipe<T = unknown, R = T> = PipeExecutor<T, R>

/**
 * Reducer callback function type used to build a sequence of pipe executions.
 *
 * @param previousPipeExecutor - The executor from the previous step in the pipeline.
 * @param currentPipe - The current pipe being added to the sequence.
 * @returns The combined executor function.
 *
 * @template T - The type of the passable object.
 * @template R - The type of the return value from the pipeline execution, defaulting to `T`.
 */
export type ReducerCallback<T = unknown, R = T, Args extends any[] = any[]> = (previousPipeExecutor: PipeExecutor<T, R>, currentPipe: MetaPipe<T, R, Args>) => PipeExecutor<T, R>

/**
 * A function type that represents a resolver for a given pipe.
 *
 * @typeParam T - The type of the passable object in the pipeline.
 * @typeParam R - The type of the return value from the resolved pipe, which defaults to `T`.
 * @param pipe - The pipe that needs to be resolved, which can be either a simple pipe or a MetaPipe.
 * @returns The resolved pipe instance of type `PipeInstance<T, R> | undefined`.
 *
 * This type is used to provide a custom mechanism for resolving pipes before they are executed in the pipeline.
 */
export type PipeResolver<T = unknown, R = T, Args extends any[] = any[]> = (pipe: MetaPipe<T, R, Args>) => PipeInstance<T, R> | undefined

/**
 * ConfigContextOptions.
 */
export interface PipelineOptions<T = unknown, R = T, Args extends any[] = any[]> {
  hooks?: PipelineHook<T, R, Args>
  resolver?: PipeResolver<T, R, Args>
}

/**
 * Represents a pipe instance that contains different pipe functions.
 *
 * @template T - The type of the passable object.
 * @template R - The type of the return value from the pipeline execution, defaulting to `T`.
 *
 * An object representing a set of functions used as part of the pipeline.
 * The keys represent function names, and the values are functions that take specific arguments.
 */
export type PipeInstance<T = unknown, R = T> = PipeDefaultInstance<T, R> | PipeCustomInstance<T, R> | object

/**
 * Represents a pipe instance that contains a default pipe function.
 *
 * @template T - The type of the passable object.
 * @template R - The type of the return value from the pipeline execution, defaulting to `T`.
 *
 * An object representing a default function used as part of the pipeline.
 * The key is the `handle` property, which is a function that takes specific arguments.
 */
export interface PipeDefaultInstance<T = unknown, R = T> {
  handle: FunctionalPipe<T, R>
}

/**
 * Represents a pipe instance that contains different pipe functions.
 *
 * @template T - The type of the passable object.
 * @template R - The type of the return value from the pipeline execution, defaulting to `T`.
 *
 * An object representing a set of functions used as part of the pipeline.
 * The keys represent function names, and the values are functions that take specific arguments.
 */
export interface PipeCustomInstance<T = unknown, R = T> {
  [key: string]: FunctionalPipe<T, R>
}

/**
 * Represents a MetaPipe configuration item, with a pipe, parameters, and priority level.
 *
 * A configuration object used for managing pipes in the pipeline.
 */
export interface MetaPipe<T = unknown, R = T, Args extends any[] = any[]> {
  /** The pipe to execute, which can be a function or a string identifier. */
  module: PipeType<T, R, Args>
  /** An optional array of parameters to pass to the pipe. */
  params?: any[]
  /** An optional priority level of the pipe. */
  priority?: number
  /** An optional flag indicating whether the pipe is a class. */
  isClass?: boolean
  /** An optional flag indicating whether the pipe is a container alias. */
  isAlias?: boolean
  /** An optional flag indicating whether the pipe is a factory. */
  isFactory?: boolean
}

/**
 * HookName Type.
 */
export type HookName = 'onProcessingPipe' | 'onPipeProcessed'

/**
 * Hook Type.
 *
 * Represents a hook that can either be synchronous or asynchronous.
 */
export type PipelineHook<T = unknown, R = T, Args extends any[] = any[]> = Record<HookName, Array<PipelineHookListener<T, R, Args>>>

/**
 * PipelineHookContext Type.
 */
export interface PipelineHookContext<T = unknown, R = T, Args extends any[] = any[]> {
  passable: T
  pipe: MetaPipe<T, R, Args>
  instance: PipeCustomInstance<T, R>
  pipes: Array<MetaPipe<T, R, Args>>
}

/**
 * PipelineHookListener Type.
 *
 * Represents a listener hook that can either be synchronous or asynchronous.
 */
export type PipelineHookListener<T = unknown, R = T, Args extends any[] = any[]> = (
  context: PipelineHookContext<T, R, Args>
) => Promiseable<void>
