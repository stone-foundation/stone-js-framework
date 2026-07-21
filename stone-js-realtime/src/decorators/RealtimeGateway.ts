import { realtimeBlueprint } from '../options/RealtimeBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType, SERVICE_KEY, setMetadata } from '@stone-js/core'

/**
 * Class decorator: mark a class as a realtime gateway.
 *
 * The class is registered as a container service and contributed to `stone.realtime.gateways`; the
 * {@link RealtimeServiceProvider} resolves it (with dependency injection) and wires its
 * `@OnConnect`/`@OnDisconnect`/`@OnMessage`/`@OnError`/`@OnSubscribe`/`@OnUnsubscribe`/`@OnEvent`
 * methods into the {@link RealtimeRouter}.
 *
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * @RealtimeGateway()
 * export class Chat {
 *   constructor (private readonly realtime) {}
 *   @OnConnect() onConnect (connection) { ... }
 *   @OnEvent('room:1', 'message') onMessage (payload, connection) { ... }
 * }
 * ```
 */
export const RealtimeGateway = <T extends ClassType = ClassType>(): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    setMetadata(context, SERVICE_KEY, { singleton: true, isClass: true })
    addBlueprint(target, context, realtimeBlueprint, {
      stone: {
        realtime: {
          gateways: [{ module: target, isClass: true }]
        }
      }
    })
  })
}
