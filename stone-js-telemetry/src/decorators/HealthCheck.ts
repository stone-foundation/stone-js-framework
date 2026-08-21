import { telemetryBlueprint } from '../options/TelemetryBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType, SERVICE_KEY, setMetadata } from '@stone-js/core'

/**
 * Declare a class as a health check.
 *
 * Three statements in one, the way every declaration decorator works here:
 *
 * 1. **It is a service.** The container builds it, as a singleton, so the check holds the very client it
 *    is checking: the database pool, the cache, the queue.
 * 2. **It is reachable by name.** The alias is bound as `health:<name>`, prefixed so a check named after
 *    a dependency never competes with the application's own binding for it.
 * 3. **It activates the module.** Declaring a check is the whole setup.
 *
 * @param name - What the report calls it. Defaults to the class name.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @HealthCheck('database')
 * export class DatabaseCheck {
 *   constructor (private readonly db: Database) {}
 *   async check (): Promise<boolean> { return await this.db.ping() }
 * }
 * ```
 */
export const HealthCheck = <T extends ClassType = ClassType>(name?: string): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    const declared = name ?? target.name

    setMetadata(context, SERVICE_KEY, { singleton: true, isClass: true, alias: `health:${declared}` })

    addBlueprint(target, context, telemetryBlueprint, {
      stone: {
        telemetry: {
          health: {
            checks: [{ name: declared, module: target, isClass: true }]
          }
        }
      }
    })
  })
}
