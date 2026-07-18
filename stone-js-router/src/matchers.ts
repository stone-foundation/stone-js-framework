import { Route } from './Route'
import { IIncomingEvent } from './declarations'

/**
 * Options for route matchers.
 *
 * @template IncomingEventType - The type representing the incoming HTTP event.
 * @template OutgoingResponseType - The type representing the outgoing HTTP response.
 *
 * @property event - The incoming HTTP event to be matched.
 * @property route - The route definition to match against.
 */
export interface MatcherOptions<IncomingEventType extends IIncomingEvent = IIncomingEvent, OutgoingResponseType = unknown> {
  event: IncomingEventType
  route: Route<IncomingEventType, OutgoingResponseType>
}

/**
 * Matches the host of an incoming HTTP event against a route's host configuration.
 *
 * @template IncomingEventType - The type representing the incoming HTTP event.
 * @template OutgoingResponseType - The type representing the outgoing HTTP response.
 *
 * @param options - The matcher options containing the route and event.
 * @returns `true` if the host matches or if no specific host is configured.
 *
 * @example
 * ```typescript
 * const match = hostMatcher({ route, event });
 * console.log(match); // true or false
 * ```
 */
export function hostMatcher<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> ({ route, event }: MatcherOptions<IncomingEventType, OutgoingResponseType>): boolean {
  const regex = route.getDomainRegex()
  return regex === undefined || regex.test(event.host)
}

/**
 * Matches the HTTP method of an incoming HTTP event against a route's method configuration.
 *
 * @template IncomingEventType - The type representing the incoming HTTP event.
 * @template OutgoingResponseType - The type representing the outgoing HTTP response.
 *
 * @param options - The matcher options containing the route and event.
 * @returns `true` if the method matches, otherwise `false`.
 *
 * @example
 * ```typescript
 * const match = methodMatcher({ route, event });
 * console.log(match); // true or false
 * ```
 */
export function methodMatcher<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> ({ route, event }: MatcherOptions<IncomingEventType, OutgoingResponseType>): boolean {
  return route.getOption('method') === event.method
}

/**
 * Matches the protocol (HTTP or HTTPS) of an incoming HTTP event against a route's configuration.
 *
 * @template IncomingEventType - The type representing the incoming HTTP event.
 * @template OutgoingResponseType - The type representing the outgoing HTTP response.
 *
 * @param options - The matcher options containing the route and event.
 * @returns `true` if the protocol matches the route's requirements, otherwise `false`.
 *
 * @example
 * ```typescript
 * const match = protocolMatcher({ route, event });
 * console.log(match); // true or false
 * ```
 */
export function protocolMatcher<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> ({ route, event }: MatcherOptions<IncomingEventType, OutgoingResponseType>): boolean {
  // Important: Always rely on route.options or route.getOption for protocol matching
  if (route.getOption('protocolPolicy') === 'force-http') { // Http only matcher
    return event.isSecure !== true
  } else if (route.getOption('protocolPolicy') === 'force-https') { // Https only matcher
    return event.isSecure === true
  } else { // No specific protocol matcher
    return true
  }
}

/**
 * Matches the URI of an incoming HTTP event against a route's path configuration.
 *
 * @template IncomingEventType - The type representing the incoming HTTP event.
 * @template OutgoingResponseType - The type representing the outgoing HTTP response.
 *
 * @param options - The matcher options containing the route and event.
 * @returns `true` if the URI matches the route's configuration, otherwise `false`.
 *
 * @example
 * ```typescript
 * const match = uriMatcher({ route, event });
 * console.log(match); // true or false
 * ```
 */
export function uriMatcher<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> ({ route, event }: MatcherOptions<IncomingEventType, OutgoingResponseType>): boolean {
  return route.getPathRegex().test(event.decodedPathname ?? event.pathname)
}
