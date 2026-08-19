import { cloneValue } from '@stone-js/config'
import { StoreDefinition } from '../defineStore'
import { storeBlueprint } from '../options/StoreBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@Store` decorator: the stores to declare, and the `stone.store` bucket.
 */
export interface StoreDecoratorOptions {
  /** The stores this application declares. */
  stores?: StoreDefinition[]
  /** The snapshot key the hydrated states live under. */
  snapshotKey?: string
}

/**
 * Class decorator: give the application a store, declaratively.
 *
 * `@Store()` registers the provider that puts every declared store in the container. A component then
 * reaches one through `useContainer()`, and a service takes it through its constructor, so the same
 * state layer serves SSR, a SPA and React Native without any of them being named here.
 *
 * @param options - The stores to declare. Everything is optional.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { Store, defineStore } from '@stone-js/store'
 *
 * @Store({ stores: [defineStore({ name: 'tasks', state: { items: [] } })] })
 * @StoneApp({ name: 'my-app' })
 * export class Application {}
 * ```
 */
export const Store = <T extends ClassType = ClassType>(options: StoreDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // The blueprint is the single source of truth for what the module declares; the decorator only
    // overrides what it can, its options bucket.
    const blueprint = cloneValue(storeBlueprint)

    blueprint.stone.store = { ...blueprint.stone.store, ...options }

    addBlueprint(target, context, blueprint)
  })
}
