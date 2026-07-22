import {
  isString,
  isFunction,
  isClassPipe,
  isFactoryPipe,
  isFunctionPipe
} from './utils'
import {
  HookName,
  MetaPipe,
  MixedPipe,
  Promiseable,
  PipeExecutor,
  PipelineHook,
  PipeResolver,
  FunctionalPipe,
  PipelineOptions,
  ReducerCallback,
  PipeCustomInstance,
  PipelineHookListener
} from './declarations'
import { PipelineError } from './PipelineError'

/**
 * Class representing a Pipeline.
 *
 * @template T - The type of the passable object in the pipeline.
 * @template R - The type of the return value from the pipeline execution.
 *
 * This class is responsible for managing and executing a series of operations
 * on a set of passable values through multiple configurable pipes.
 */
export class Pipeline<T = unknown, R = T, Args extends any[] = any[]> {
  /** The passable objects sent through the pipeline */
  private passable?: T

  /** The method name to call on each pipe */
  private method: string

  /** Flag indicating whether the pipeline should run synchronously or asynchronously */
  private isSync: boolean = false

  /** The default priority for the pipes in the pipeline */
  private _defaultPriority: number

  /** The raw pipes registered via `through`/`pipe`, normalized and sorted at execution time. */
  private rawPipes: Array<MixedPipe<T, R, Args>>

  /** The sorted metadata pipes that will be executed (computed at `then` time). */
  private sortedMetaPipes: Array<MetaPipe<T, R, Args>>

  /** The pipeline hooks */
  private readonly hooks: PipelineHook<T, R, Args>

  /** The resolver function used to resolve pipes before they are executed in the pipeline. */
  private readonly resolver?: PipeResolver<T, R>

  /**
   * Create a pipeline instance.
   *
   * @param options - Optional Pipeline options.
   * @returns The pipeline instance.
   */
  static create<T = unknown, R = T, Args extends any[] = any[]>(options?: PipelineOptions<T, R, Args>): Pipeline<T, R> {
    return new this(options)
  }

  /**
   * Initialize a new Pipeline instance.
   *
   * @param options - Optional Pipeline options.
   */
  protected constructor (options?: PipelineOptions<T, R, Args>) {
    this.method = 'handle'
    this.rawPipes = []
    this.sortedMetaPipes = []
    this._defaultPriority = 10
    this.resolver = options?.resolver
    this.hooks = options?.hooks ?? {} as any
  }

  /**
   * Set the default priority for pipes in the pipeline.
   *
   * @param value - The priority value to set.
   * @returns The current Pipeline instance.
   */
  defaultPriority (value: number): this {
    this._defaultPriority = value
    // Re-normalize so the new default applies even when set after `through()`.
    this.sortedMetaPipes = this.buildSortedPipes()
    return this
  }

  /**
   * Set the passable objects being sent through the pipeline.
   *
   * @param passable - The object to pass through the pipeline.
   * @returns The current Pipeline instance.
   */
  send (passable: T): this {
    this.passable = passable
    return this
  }

  /**
   * Set the pipes for the pipeline.
   *
   * @param pipes - The pipes or MetaPipe instances.
   * @returns The current Pipeline instance.
   */
  through (...pipes: Array<MixedPipe<T, R, Args>>): this {
    // Store raw pipes; priority (including the default) is resolved from `_defaultPriority`
    // at build time, so `defaultPriority()` works regardless of whether it is called before
    // or after `through()`. `sortedMetaPipes` is kept in sync for inspection.
    this.rawPipes = pipes
    this.sortedMetaPipes = this.buildSortedPipes()
    return this
  }

  /**
   * Add additional pipes to the pipeline.
   *
   * @param {...MixedPipe} pipe - A single pipe or a list of pipes to add.
   * @returns The current Pipeline instance.
   */
  pipe (...pipe: Array<MixedPipe<T, R, Args>>): this {
    this.rawPipes = [...this.rawPipes, ...pipe]
    this.sortedMetaPipes = this.buildSortedPipes()
    return this
  }

  /**
   * Normalize the raw pipes into sorted meta pipes.
   *
   * Applies the default priority only when a pipe does not specify one (an explicit
   * `priority: undefined` no longer silently overrides the default), dedupes by module
   * (last occurrence wins — override semantics), then orders by priority. Order semantics
   * are preserved from prior versions: higher priority runs first, and for equal priorities
   * the last-registered pipe runs first.
   *
   * @returns The sorted meta pipes.
   */
  private buildSortedPipes (): Array<MetaPipe<T, R, Args>> {
    const priority = this._defaultPriority
    const metaPipes: Array<MetaPipe<T, R, Args>> = this.rawPipes.map(
      pipe => {
        if (isString(pipe)) { return parseAliasPipe<T, R, Args>(pipe, priority) }
        if (isFunction(pipe)) { return { module: pipe, priority, isAlias: false } }
        return { ...pipe, priority: pipe.priority ?? priority }
      }
    )

    const deduped = Array.from(
      metaPipes.reduce((acc, pipe) => acc.set(pipe.module, pipe), new Map<unknown, MetaPipe<T, R, Args>>()).values()
    )

    // Ascending stable sort then reverse — preserves the established ordering while
    // guaranteeing every priority is a number (no non-deterministic `undefined`).
    /* v8 ignore next -- priority is normalised to a number for every pipe just above, so the `?? priority` fallbacks are unreachable at runtime. */
    deduped.sort((a, b) => (a.priority ?? priority) - (b.priority ?? priority))
    return deduped.reverse()
  }

  /**
   * Set the method to call on each pipe.
   *
   * @param method - The method name to use on each pipe.
   * @returns The current Pipeline instance.
   */
  via (method: string): this {
    this.method = method
    return this
  }

  /**
   * Configure the pipeline to run synchronously or asynchronously.
   *
   * @param value - Set true for sync, false for async (default is true).
   * @returns The current Pipeline instance.
   */
  sync (value: boolean = true): this {
    this.isSync = value
    return this
  }

  /**
   * Add a hook to the pipeline.
   *
   * @param name - The name of the hook.
   * @param listener - The hook listener function.
   * @returns The current Pipeline instance.
   */
  on (name: HookName, listener: PipelineHookListener<T, R, Args> | Array<PipelineHookListener<T, R, Args>>): this {
    this.hooks[name] ??= []
    this.hooks[name] = this.hooks[name].concat(listener)

    return this
  }

  /**
   * Run the pipeline with a final destination callback.
   *
   * @param destination - The final function to execute.
   * @returns The result of the pipeline, either synchronously or as a Promise.
   */
  then (destination: PipeExecutor<T, R>): Promiseable<R> {
    if (this.passable === undefined) {
      throw new PipelineError('No passable object has been set for this pipeline.')
    }

    // Resolve priorities now (with the final `_defaultPriority`), so ordering is
    // independent of the fluent-call order.
    this.sortedMetaPipes = this.buildSortedPipes()

    return this
      .sortedMetaPipes
      .reduce<PipeExecutor<T, R>>(
      this.isSync ? this.reducer() : this.asyncReducer(),
      destination.bind(destination)
    )(this.passable)
  }

  /**
   * Run the pipeline and return the result.
   *
   * @returns The result of the pipeline, either synchronously or as a Promise.
   */
  thenReturn (): Promiseable<R> {
    return this.then((passable) => passable as unknown as R)
  }

  /**
   * Get the asynchronous reducer to iterate over the pipes.
   *
   * @returns The asynchronous reducer callback.
   */
  private asyncReducer (): ReducerCallback<T, R, Args> {
    return (previousPipeExecutor: PipeExecutor<T, R>, currentPipe: MetaPipe<T, R, Args>): PipeExecutor<T, R> => {
      return async (passable: T): Promise<R> => {
        return await this.executeAsyncPipe(currentPipe, passable, previousPipeExecutor)
      }
    }
  }

  /**
   * Get the synchronous reducer to iterate over the pipes.
   *
   * @returns The synchronous reducer callback.
   */
  private reducer (): ReducerCallback<T, R, Args> {
    return (previousPipeExecutor: PipeExecutor<T, R>, currentPipe: MetaPipe<T, R, Args>): PipeExecutor<T, R> => {
      return (passable: T): R => {
        return this.executePipe(currentPipe, passable, previousPipeExecutor)
      }
    }
  }

  /**
   * Resolve and execute async pipe.
   *
   * @param currentPipe - The current pipe to execute (class or service alias string).
   * @param passable - The passable object to send through the pipe.
   * @param previousPipeExecutor - The previous pipe executor in the sequence.
   * @returns The result of the pipe execution.
   * @throws PipelineError If the pipe cannot be resolved or the method is missing.
   */
  private async executeAsyncPipe (currentPipe: MetaPipe<T, R, Args>, passable: T, previousPipeExecutor: PipeExecutor<T, R>): Promise<R> {
    const instance = this.resolvePipe(currentPipe)

    await this.executeAsyncHooks('onProcessingPipe', currentPipe, instance, passable)

    const result = await instance[this.method](passable, previousPipeExecutor, ...(currentPipe.params ?? []))

    await this.executeAsyncHooks('onPipeProcessed', currentPipe, instance, passable)

    return result
  }

  /**
   * Resolve and execute a pipe.
   *
   * @param currentPipe - The current pipe to execute (class or service alias string).
   * @param passable - The passable object to send through the pipe.
   * @param previousPipeExecutor - The previous pipe executor in the sequence.
   * @returns The result of the pipe execution.
   * @throws PipelineError If the pipe cannot be resolved or the method is missing.
   */
  private executePipe (currentPipe: MetaPipe<T, R, Args>, passable: T, previousPipeExecutor: PipeExecutor<T, R>): R {
    const instance = this.resolvePipe(currentPipe)

    this.executeHooks('onProcessingPipe', currentPipe, instance, passable)

    const result = instance[this.method](passable, previousPipeExecutor, ...(currentPipe.params ?? []))

    this.executeHooks('onPipeProcessed', currentPipe, instance, passable)

    return result as R
  }

  /**
   * Resolve pipe.
   *
   * @param currentPipe - The current pipe to execute (class or service alias string).
   * @returns The resolved pipe instance.
   * @throws PipelineError If the pipe cannot be resolved or the method is missing.
   */
  private resolvePipe (currentPipe: MetaPipe<T, R, Args>): PipeCustomInstance<T, R> {
    let instance = (isFunction(this.resolver) ? this.resolver(currentPipe) : undefined) as (PipeCustomInstance<T, R> | undefined)

    if (instance === undefined) {
      instance = this.createInstanceFromPipe(currentPipe)

      if (instance === undefined) {
        throw new PipelineError(`Cannot resolve this pipe ${String(currentPipe)}.`)
      }
    } else if (isFunction<FunctionalPipe<T, R>>(instance)) {
      instance = { [this.method]: instance }
    }

    this.validatePipeMethod(instance, currentPipe)

    return instance
  }

  /**
   * Create an instance from the provided pipe.
   *
   * @param currentPipe - The pipe function to create an instance from.
   * @returns The created instance or an object with the method.
   */
  private createInstanceFromPipe (currentPipe: MetaPipe<T, R, Args>): PipeCustomInstance<T, R> | undefined {
    if (isFunction(currentPipe.module)) {
      if (isClassPipe(currentPipe)) {
        const PipeClass = currentPipe.module as new (...args: Args) => PipeCustomInstance<T, R>
        return new PipeClass(...([] as unknown as Args))
      } else if (isFactoryPipe(currentPipe)) {
        return { [this.method]: currentPipe.module(...([] as unknown as Args)) }
      } else if (isFunctionPipe(currentPipe)) {
        return { [this.method]: currentPipe.module }
      }
    }
  }

  /**
   * Validate that the required method exists on the instance.
   *
   * @param instance - The instance to validate.
   * @param currentPipe - The current pipe being executed.
   * @throws {PipelineError} If the method does not exist on the instance.
   */
  private validatePipeMethod (instance: PipeCustomInstance<T, R>, currentPipe: MetaPipe<T, R, Args>): void {
    if (!isFunction(instance[this.method])) {
      let name: string
      if (isFunction(currentPipe.module)) {
        name = currentPipe.module.name.length > 0 ? currentPipe.module.name : 'anonymous'
      } else {
        name = String(currentPipe.module)
      }
      throw new PipelineError(
        `No method "${this.method}" exists on pipe "${name}".`
      )
    }
  }

  /**
   * Execute lifecycle async hooks.
   *
   * @param name - The hook's name.
   * @param pipe - The current pipe instance.
   */
  private async executeAsyncHooks (
    name: HookName,
    pipe: MetaPipe<T, R, Args>,
    instance: PipeCustomInstance<T, R>,
    passable: T
  ): Promise<void> {
    if (Array.isArray(this.hooks[name])) {
      for (const listener of this.hooks[name]) {
        await listener({ passable, instance, pipe, pipes: this.sortedMetaPipes })
      }
    }
  }

  /**
   * Execute lifecycle hooks.
   *
   * @param name - The hook's name.
   * @param pipe - The current pipe instance.
   */
  private executeHooks (
    name: HookName,
    pipe: MetaPipe<T, R, Args>,
    instance: PipeCustomInstance<T, R>,
    passable: T
  ): void {
    if (Array.isArray(this.hooks[name])) {
      for (const listener of this.hooks[name]) {
        listener({ passable, instance, pipe, pipes: this.sortedMetaPipes }) as never
      }
    }
  }
}

/**
 * Parse an alias-pipe string into a {@link MetaPipe}, supporting inline parameters.
 *
 * Syntax: `'alias'` or `'alias:param1,param2,...'`. Parameters are split on commas, trimmed,
 * and coerced (`true`/`false` → boolean, `null` → null, numeric → number, otherwise string),
 * then passed as extra arguments to the pipe method after `(passable, next)`.
 *
 * @example
 * ```ts
 * pipeline.through('throttle:60,100')   // → throttle(passable, next, 60, 100)
 * pipeline.through('auth:admin')        // → auth(passable, next, 'admin')
 * pipeline.through('feature:beta,true') // → feature(passable, next, 'beta', true)
 * ```
 *
 * @param pipe - The alias string.
 * @param priority - The priority to assign.
 * @returns The parsed meta pipe.
 */
function parseAliasPipe<T, R, Args extends any[]> (pipe: string, priority: number): MetaPipe<T, R, Args> {
  const separatorIndex = pipe.indexOf(':')

  if (separatorIndex === -1) {
    return { module: pipe.trim() as unknown as MetaPipe<T, R, Args>['module'], priority, isAlias: true }
  }

  const alias = pipe.slice(0, separatorIndex).trim()
  const rawParams = pipe.slice(separatorIndex + 1)
  const params = rawParams.length > 0 ? rawParams.split(',').map(coercePipeParam) : undefined

  return {
    module: alias as unknown as MetaPipe<T, R, Args>['module'],
    priority,
    isAlias: true,
    ...(params !== undefined ? { params: params as Args } : {})
  }
}

/**
 * Coerce a raw string parameter to a boolean, null, number, or trimmed string.
 *
 * @param raw - The raw parameter.
 * @returns The coerced value.
 */
function coercePipeParam (raw: string): unknown {
  const value = raw.trim()
  if (value === 'true') { return true }
  if (value === 'false') { return false }
  if (value === 'null') { return null }
  if (value.length > 0 && /^-?\d+(\.\d+)?$/.test(value)) { return Number(value) }
  return value
}
