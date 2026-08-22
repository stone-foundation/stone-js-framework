import { storeBlueprint } from '../options/StoreBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/** Options for the `@FeatureStore` declaration. */
export interface FeatureStoreOptions {
  /**
   * Whether the server keeps one instance per request. Default `true`, deliberately: a shared store
   * leaks one visitor's state into the next visitor's page during server rendering, and the leak is
   * invisible in development where there is only ever one request at a time.
   */
  perRequest?: boolean
}

/**
 * Declare a class as a feature's store.
 *
 * A feature owns its client, its service and its state, and this is how the state half is declared:
 * a class extending `StateStore`, holding the actions that move it. Two statements in one, the way
 * every declaration decorator works here:
 *
 * 1. **The container builds it.** Its constructor is auto-wired like any other class, which is what a
 *    data definition cannot express: the store's actions call the services they were handed.
 * 2. **It activates the module.** The blueprint comes with the decorator, so declaring a store is the
 *    whole setup, and it is resolved under `store.<name>`, hydrated from the snapshot, and given the
 *    per-request lifetime, exactly like a store declared as data.
 *
 * The imperative counterpart is `defineStore(CompetitionStore, { name: 'competition' })`, and the two
 * declare the same thing: neither paradigm can do something the other cannot.
 *
 * @param name - The name it is resolved under, in the container and in the snapshot. Defaults to the
 *               class name.
 * @param options - The lifetime.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @FeatureStore('competition')
 * export class CompetitionStore extends StateStore<CompetitionState> {
 *   private readonly client: CompetitionClient
 *
 *   constructor ({ competitionClient }: { competitionClient: CompetitionClient }) {
 *     super({ list: [], selected: undefined })
 *     this.client = competitionClient
 *   }
 *
 *   async load (): Promise<void> {
 *     this.setState({ list: await this.client.list() })
 *   }
 * }
 * ```
 */
export const FeatureStore = <T extends ClassType = ClassType>(
  name?: string,
  options: FeatureStoreOptions = {}
): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    addBlueprint(target, context, storeBlueprint, {
      stone: {
        store: {
          stores: [{
            name: name ?? target.name,
            module: target,
            isClass: true,
            perRequest: options.perRequest
          }]
        }
      }
    })
  })
}
