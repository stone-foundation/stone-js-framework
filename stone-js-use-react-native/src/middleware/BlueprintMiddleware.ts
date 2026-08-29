import { ScreenStack } from '../ScreenStack'
import { setCurrentScreenStack } from '../currentStack'
import { STONE_SCREEN_STACK } from '../constants'
import { onPreparingResponse } from '../PageHooks'
import { REACT_NATIVE_PLATFORM } from '@stone-js/react-native-adapter'
import { MetaNativeResponseMiddleware } from './ResponseMiddleware'
import { ClassType, IBlueprint, NextMiddleware, BlueprintContext, MetaMiddleware, isEmpty } from '@stone-js/core'
import {
  SetReactPageLayoutMiddleware,
  SetReactViewProvidersMiddleware,
  SetUseReactEventHandlerMiddleware,
  SetReactKernelErrorPageMiddleware,
  SetReactRouteDefinitionsMiddleware
} from '@stone-js/use-react-core'

/**
 * Give the application one screen stack, before any event.
 *
 * Everything that touches navigation has to agree on the same stack: the middleware that
 * displays a resolved route, the runtime that sets a screen title, and whatever component
 * shows the screens. Creating it here, once, during the build phase, is what guarantees they
 * all mean the same object.
 *
 * @param context - The configuration context.
 * @param next - The next pipeline function.
 * @returns The updated blueprint.
 */
export const SetScreenStackMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  const key = `stone.useReactNative.${STONE_SCREEN_STACK}`
  const supplied = context.blueprint.get<ScreenStack>(key)
  const stack = isEmpty(supplied) ? ScreenStack.create() : supplied

  if (isEmpty(supplied)) {
    context.blueprint.set(key, stack)
  }

  // Published outside the container as well, because the root component is outside every event and
  // has no container to ask. The object in hand, not a read-back: see `currentStack.ts`.
  setCurrentScreenStack(stack)

  return await next(context)
}

/**
 * Register the renderer on the native adapter.
 *
 * Two things, both conditional on actually running on a phone, so an application carrying
 * several adapters (a native build and a web one from the same source) only pays for the one
 * it runs: the response middleware that displays a route, and the hook that turns a kernel
 * response into a page.
 *
 * @param context - The configuration context.
 * @param next - The next pipeline function.
 * @returns The updated blueprint.
 */
export const SetNativeRendererMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  if (context.blueprint.get<string>('stone.adapter.platform') === REACT_NATIVE_PLATFORM) {
    context.blueprint.add('stone.adapter.middleware', [MetaNativeResponseMiddleware])
    context.blueprint.add('stone.lifecycleHooks.onPreparingResponse', [onPreparingResponse])
  }

  return await next(context)
}

/**
 * The renderer's build-phase middleware.
 *
 * The five shared ones are what read your classes: they turn `@Page` into route definitions,
 * `@PageLayout` into layouts, `@ErrorPage` into error pages and `@ViewProvider` into
 * providers. They are installed here exactly as the web renderer installs them, because that
 * reading is the same work, and it is the reason a page needs no native variant.
 *
 * The two native ones come first by dependency: the stack has to exist before anything reads
 * it, and the renderer is registered once the current adapter is known, since it matches on
 * the platform. Priorities are spaced so a module can slot a step of its own between them.
 */
export const metaUseReactNativeBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: SetScreenStackMiddleware, priority: 4 },
  { module: SetNativeRendererMiddleware, priority: 8 },
  { module: SetUseReactEventHandlerMiddleware, priority: 2 },
  { module: SetReactPageLayoutMiddleware, priority: 10 },
  { module: SetReactViewProvidersMiddleware, priority: 10 },
  { module: SetReactKernelErrorPageMiddleware, priority: 10 },
  { module: SetReactRouteDefinitionsMiddleware, priority: 10 }
]
