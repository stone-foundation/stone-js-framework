import { Logger } from '../logger/Logger'
import { IBlueprint, BlueprintContext, BlueprintHookType, IBlueprintBuilder } from '../declarations'
import { isClassPipe, isFactoryPipe, MetaPipe, MixedPipe, Pipeline, PipelineOptions } from '@stone-js/pipeline'

/**
 * Class representing a BlueprintBuilder for the Stone.js framework.
 *
 * The BlueprintBuilder is responsible for constructing and configuring the dynamic, complex structured options required by the Stone.js framework.
 * It introspects various modules, extracts metadata, and builds the "blueprint" object which serves as the primary configuration for the Stone.js application.
 * This class also manages middleware used to process and populate the configuration during the application setup.
 *
 * The BlueprintBuilder allows users to create a unified configuration that is used to initialize and bootstrap the Stone.js application,
 * ensuring all necessary metadata is aggregated into a blueprint that can be used consistently throughout the application lifecycle.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class BlueprintBuilder<
  BlueprintType extends IBlueprint = IBlueprint,
  ContextType extends BlueprintContext<BlueprintType> = BlueprintContext<BlueprintType>
> implements IBlueprintBuilder<BlueprintType> {
  private readonly defaultMiddlewarePriority: number
  private readonly hooks: BlueprintHookType<BlueprintType, ContextType>
  private readonly middleware: Array<MixedPipe<ContextType, BlueprintType>>

  /**
   * Create a BlueprintBuilder.
   *
   * @param blueprint - The blueprint to create a BlueprintBuilder.
   * @returns A new BlueprintBuilder instance.
   */
  static create<
    BlueprintType extends IBlueprint = IBlueprint,
    ContextType extends BlueprintContext<BlueprintType> = BlueprintContext<BlueprintType>
  >(blueprint: BlueprintType): BlueprintBuilder<BlueprintType, ContextType> {
    return new this(blueprint)
  }

  /**
   * Create a BlueprintBuilder.
   *
   * @param blueprint - The blueprint to create a BlueprintBuilder.
   */
  private constructor (private readonly blueprint: BlueprintType) {
    this.hooks = blueprint.get('stone.lifecycleHooks', {})
    this.middleware = blueprint.get('stone.blueprint.middleware', [])
    this.defaultMiddlewarePriority = blueprint.get('stone.blueprint.defaultMiddlewarePriority', 10)
  }

  /**
   * Build the configuration blueprint by extracting metadata from the provided modules.
   *
   * This method processes the given raw modules, extracts metadata to populate the blueprint,
   * and returns the resulting configuration blueprint.
   *
   * @param modules - The modules to build the configuration from.
   * @returns The configuration blueprint.
   *
   * @example
   * ```typescript
   * const BlueprintBuilder = BlueprintBuilder.create(Config.create());
   * const blueprint = await BlueprintBuilder.build(rawModules);
   * ```
   */
  public async build (modules: unknown[]): Promise<BlueprintType> {
    const context = {
      modules,
      blueprint: this.blueprint
    } as unknown as ContextType

    await this.executeHooks('onPreparingBlueprint', context)

    // `defaultPriority` must be set BEFORE `through`: the pipeline stamps each pipe's
    // priority at registration time, so calling it afterwards had no effect.
    const blueprint = await Pipeline
      .create(this.makePipelineOptions())
      .send(context)
      .defaultPriority(this.defaultMiddlewarePriority)
      .through(...this.middleware)
      .then((v) => v.blueprint)

    await this.executeHooks('onBlueprintPrepared', context)

    return blueprint
  }

  /**
   * Creates pipeline options for the BlueprintBuilder.
   *
   * @returns The pipeline options for configuring middleware.
   */
  private makePipelineOptions (): PipelineOptions<ContextType, BlueprintType> {
    return {
      hooks: {
        onPipeProcessed: this.hooks.onBlueprintMiddlewareProcessed ?? [],
        onProcessingPipe: this.hooks.onProcessingBlueprintMiddleware ?? []
      },
      resolver: (metaPipe: MetaPipe<ContextType, BlueprintType>) => {
        if (isClassPipe(metaPipe)) {
          return new metaPipe.module.prototype.constructor({ logger: Logger.getInstance() })
        } else if (isFactoryPipe(metaPipe)) {
          return metaPipe.module({ logger: Logger.getInstance() })
        }
      }
    }
  }

  /**
   * Execute lifecycle hooks.
   *
   * @param name - The name of the hook to
   * @param context - The context to pass to the hook.
   */
  private async executeHooks (name: 'onPreparingBlueprint' | 'onBlueprintPrepared', context: ContextType): Promise<void> {
    if (Array.isArray(this.hooks[name])) {
      for (const listener of this.hooks[name]) {
        await listener(context)
      }
    }
  }
}
