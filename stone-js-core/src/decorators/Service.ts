import { SERVICE_KEY } from './constants'
import { setClassMetadata } from './Metadata'
import { ClassType, ServiceOptions } from '../declarations'

/**
 * Service decorator to mark a class as a service and automatically bind it to the container.
 *
 * This decorator is useful for marking classes that should be treated as services by the Stone.js framework,
 * making them easily injectable and manageable by the service container.
 *
 * @param options - The configuration options for the service, including singleton and alias settings.
 * @returns A decorator function to set metadata on the target class.
 *
 * @example
 * ```typescript
 * @Service({ singleton: true, alias: 'MyService' })
 * class MyService {
 *   // Service class logic here.
 * }
 * ```
 */
export const Service = <T extends ClassType = ClassType>(options: Partial<ServiceOptions> = {}): ClassDecorator => {
  return setClassMetadata<T>(SERVICE_KEY, { ...options, isClass: true })
}
