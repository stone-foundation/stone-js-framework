import { REACT_NATIVE_PLATFORM } from '../constants'
import { makeNativeNavigator } from '../navigators'
import { NavigationSource } from '../NavigationSource'
import { OutgoingBrowserResponse, OutgoingBrowserResponseOptions } from '@stone-js/browser-core'
import { ClassType, BlueprintContext, IBlueprint, NextMiddleware, MetaMiddleware } from '@stone-js/core'

/**
 * Give the application one navigation source, and make the router navigate through it.
 *
 * Both halves have to be the same object: the adapter listens to the source, the router
 * pushes into it. Creating it here, once, before any event, is what guarantees that and is
 * why this is a build-phase middleware rather than something the adapter does at runtime.
 *
 * A source already configured under `stone.reactNative.navigationSource` is respected
 * (that is the seam for a custom base URL, or a test's own source), and so is a navigator
 * the application set for itself.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function.
 * @returns The updated blueprint.
 */
export const SetNativeNavigationMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === REACT_NATIVE_PLATFORM) {
    const source = context.blueprint.get<NavigationSource>(
      'stone.reactNative.navigationSource',
      NavigationSource.create({ baseUrl: context.blueprint.get<string>('stone.reactNative.baseUrl') })
    )

    context.blueprint.set('stone.reactNative.navigationSource', source)

    if (context.blueprint.get('stone.router.navigator') === undefined) {
      context.blueprint.set('stone.router.navigator', makeNativeNavigator(source))
    }
  }

  return await next(context)
}

/**
 * Resolve the kernel's responses into browser responses.
 *
 * The same response class the browser uses: a native application has no status line to
 * write, but the kernel still needs a response type, and reusing this one is what lets a
 * page's `handle()` return the same thing on both platforms.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function.
 * @returns The updated blueprint.
 */
export const SetNativeResponseResolverMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === REACT_NATIVE_PLATFORM) {
    context.blueprint.set(
      'stone.kernel.responseResolver',
      (options: OutgoingBrowserResponseOptions) => OutgoingBrowserResponse.create(options)
    )
  }

  return await next(context)
}

/**
 * The adapter's build-phase middleware.
 *
 * Priorities are spaced so a module can slot its own step between two of these: the
 * navigation source must exist before anything reads it, and the response resolver only
 * needs to be in place before the first event.
 */
export const metaAdapterBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetNativeNavigationMiddleware, priority: 4 },
  { module: SetNativeResponseResolverMiddleware, priority: 6 }
]
