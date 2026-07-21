import { cloneValue } from '@stone-js/config'
import { BusListenConfig } from '../declarations'
import { eventBusBlueprint } from '../options/EventBusBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Options for the `@BusListener` decorator.
 */
export interface BusListenerOptions extends BusListenConfig {}

/**
 * Class decorator: enable the listener side of the bus (route incoming bus events to `@OnBusEvent`).
 *
 * Makes the bus the kernel event handler, so it plugs onto any simple cloud adapter that runs the
 * kernel (AWS Lambda, GCP, Azure...). The `source` names the incoming-event property carrying the
 * routing key (defaults to `detail-type`); pass an `extractor` for full control. Typically used on a
 * dedicated consumer function.
 *
 * @param options - The listener configuration.
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * @BusListener({ source: 'detail-type' })
 * @AwsLambda()
 * @StoneApp({ name: 'consumer' })
 * export class Application {}
 * ```
 */
export const BusListener = <T extends ClassType = ClassType>(options: BusListenerOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const blueprint = cloneValue(eventBusBlueprint)
    blueprint.stone.eventBus.listen = { ...options }
    addBlueprint(target, context, blueprint)
  })
}
