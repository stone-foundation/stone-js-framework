import { cloneValue } from '@stone-js/config'
import { TelemetryConfig, telemetryBlueprint } from '../options/TelemetryBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@Telemetry` decorator: the `stone.telemetry` bucket, every key optional.
 */
export interface TelemetryDecoratorOptions extends TelemetryConfig {}

/**
 * Class decorator: measure what the application actually does, declaratively.
 *
 * `@Telemetry()` registers the telemetry service provider (so `constructor ({ telemetry })` works
 * anywhere) and the kernel middleware that traces every event through the pipeline. It is on by
 * default once enabled; pass `enabled: false` to keep the wiring and mute the collection, which is
 * what a test run usually wants.
 *
 * The declarative half of the pair; `telemetryBlueprint` handed to `defineStoneApp` is the imperative one.
 *
 * @param options - The telemetry configuration. Everything is optional.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * import { Telemetry } from '@stone-js/telemetry'
 *
 * @Telemetry({ serviceName: 'tasks-api' })
 * @StoneApp({ name: 'my-app' })
 * export class Application {}
 * ```
 */
export const Telemetry = <T extends ClassType = ClassType>(options: TelemetryDecoratorOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    // The blueprint is the single source of truth for what the module declares; the decorator only
    // overrides what it can, its options bucket. Cloning is what lets it: two decorated applications
    // get their own copy instead of sharing the exported constant.
    const blueprint = cloneValue(telemetryBlueprint)

    blueprint.stone.telemetry = { ...blueprint.stone.telemetry, ...options }

    addBlueprint(target, context, blueprint)
  })
}
