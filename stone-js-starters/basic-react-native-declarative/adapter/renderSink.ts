import { OutgoingBrowserResponse } from '@stone-js/browser-core'

/**
 * A render listener: receives the kernel's outgoing response for display.
 */
export type NativeRenderListener = (response: OutgoingBrowserResponse) => void

/**
 * An error listener: receives adapter-level errors for display.
 */
export type NativeErrorListener = (error: Error) => void

let renderListener: NativeRenderListener | undefined
let errorListener: NativeErrorListener | undefined

/**
 * Register the render effect target. In this proof of concept the target is
 * the React root component's state; the future `@stone-js/use-react-native`
 * response middleware will push into the native navigation stack instead.
 *
 * @param listener - The render listener.
 */
export function onNativeRender (listener: NativeRenderListener): void {
  renderListener = listener
}

/**
 * Register the error display target.
 *
 * @param listener - The error listener.
 */
export function onNativeError (listener: NativeErrorListener): void {
  errorListener = listener
}

/**
 * Push an outgoing response to the registered render target.
 *
 * @param response - The kernel's outgoing response.
 */
export function emitNativeRender (response: OutgoingBrowserResponse): void {
  renderListener?.(response)
}

/**
 * Push an error to the registered error target.
 *
 * @param error - The error to display.
 */
export function emitNativeError (error: Error): void {
  errorListener?.(error)
}
