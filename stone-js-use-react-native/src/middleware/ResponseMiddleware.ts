import { ScreenStack } from '../ScreenStack'
import { STONE_SCREEN_STACK } from '../constants'
import { NativeResponseContent, ScreenTransition } from '../declarations'
import { UseReactNativeError } from '../errors/UseReactNativeError'
import { ReactNativeAdapterContext, ReactNativeAdapterResponseBuilder } from '@stone-js/react-native-adapter'
import { IBlueprint, isEmpty, isNotEmpty, NextMiddleware, type MetaMiddleware } from '@stone-js/core'

/**
 * Puts what the kernel resolved onto the navigation stack.
 *
 * The native counterpart of the browser response middleware, and it does the same thing at
 * the same moment: it contributes the deferred effect the adapter runs once the response
 * exists. The web effect renders into a document; this one pushes a screen.
 *
 * How the screen enters the stack is read from the navigation intent rather than decided
 * here, because only the caller knows: a `navigate(..., true)` replaces, a redirect
 * replaces, and everything else pushes so the back gesture has somewhere to go.
 */
export class NativeResponseMiddleware {
  private readonly blueprint: IBlueprint

  /**
   * Create the middleware.
   *
   * @param options - Options containing the blueprint.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Handle the response.
   *
   * @param context - The adapter context.
   * @param next - The next middleware.
   * @returns The response builder.
   * @throws {UseReactNativeError} When the context is missing required components.
   */
  async handle (
    context: ReactNativeAdapterContext,
    next: NextMiddleware<ReactNativeAdapterContext, ReactNativeAdapterResponseBuilder>
  ): Promise<ReactNativeAdapterResponseBuilder> {
    const rawResponseBuilder = await next(context)

    if (
      context.incomingEvent === undefined ||
      context.outgoingResponse === undefined ||
      rawResponseBuilder?.add === undefined
    ) {
      throw new UseReactNativeError('The context is missing required components.')
    }

    return rawResponseBuilder.add('render', () => this.display(context))
  }

  /**
   * Put the resolved content on the stack.
   *
   * @param context - The adapter context.
   * @returns The screen that was displayed.
   */
  private display (context: ReactNativeAdapterContext): unknown {
    const response = context.outgoingResponse

    if (isEmpty(response)) {
      throw new UseReactNativeError('No response provided for rendering.')
    }

    const content = response.content as NativeResponseContent
    const element = content?.app ?? content?.component

    if (isEmpty(element)) {
      throw new UseReactNativeError(
        'Nothing to display for this route. A native application renders pages: check that this route is answered by a page rather than by a plain handler.'
      )
    }

    const stack = this.resolveScreenStack()
    const path = content.path ?? context.incomingEvent?.pathname ?? '/'
    const screen = stack.navigate({ path, element, title: content.head?.title }, this.resolveTransition(context))

    return screen
  }

  /**
   * Read how this screen should enter the stack.
   *
   * @param context - The adapter context.
   * @returns The transition.
   */
  private resolveTransition (context: ReactNativeAdapterContext): ScreenTransition {
    const metadata = context.rawEvent?.metadata as Record<string, unknown> | undefined

    if (isNotEmpty<ScreenTransition>(metadata?.transition as ScreenTransition)) {
      return metadata?.transition as ScreenTransition
    }

    return metadata?.replace === true ? 'replace' : 'push'
  }

  /**
   * Resolve the shared screen stack.
   *
   * @returns The screen stack.
   */
  private resolveScreenStack (): ScreenStack {
    const stack = this.blueprint.get<ScreenStack>(`stone.useReactNative.${STONE_SCREEN_STACK}`)

    if (isEmpty(stack)) {
      throw new UseReactNativeError('No screen stack was registered. Enable the renderer with `@UseReactNative()` or its blueprint.')
    }

    return stack
  }
}

/**
 * Meta middleware for displaying native responses.
 */
export const MetaNativeResponseMiddleware: MetaMiddleware = { module: NativeResponseMiddleware, isClass: true }
