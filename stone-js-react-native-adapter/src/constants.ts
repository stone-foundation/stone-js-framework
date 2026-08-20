/**
 * A constant representing the React Native platform identifier.
 *
 * This is the alias every incoming event carries on its source, and what a middleware,
 * an error handler or a service provider matches on to know it runs inside a native
 * application rather than a browser or a server.
 */
export const REACT_NATIVE_PLATFORM = 'react-native'

/**
 * The scheme used by the synthetic base URL.
 *
 * A native application has no document location, but the router matches on a URL, so an
 * in-app navigation to `/tasks` is resolved against a base of `stone://app`. Deep links
 * arrive with their own scheme and host and are used as they are.
 */
export const DEFAULT_BASE_URL = 'stone://app'
