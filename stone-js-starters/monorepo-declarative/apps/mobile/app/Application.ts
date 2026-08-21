import { Routing } from '@stone-js/router'
import { LogLevel, StoneApp } from '@stone-js/core'
import { domainBlueprint } from '@acme/domain'
import { ReactNative } from '@stone-js/react-native-adapter'
import { UseReactNative } from '@stone-js/use-react-native'

/**
 * The mobile application.
 *
 * Four decorators and one blueprint. `@ReactNative()` says where events come from, deep links
 * included, `@UseReactNative()` says what a resolved route becomes, and `domainBlueprint` brings in
 * the shared domain, which is the only line here that has anything to do with what the application
 * is *about*.
 *
 * Compare with `apps/web/app/Application.ts`: the same file with two decorators swapped. That is the
 * whole difference between a website and a native application in this repository.
 *
 * Screens live in their own files, one route each. See `app/TaskListScreen.tsx`.
 */
@Routing()
@ReactNative()
@UseReactNative()
@StoneApp({ name: 'acme-mobile', logger: { level: LogLevel.INFO } }, [domainBlueprint])
export class Application {}
