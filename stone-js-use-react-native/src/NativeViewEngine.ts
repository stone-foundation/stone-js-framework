import { ScreenStack } from './ScreenStack'
import { createElement as reactCreateElement, ReactNode } from 'react'
import { UseReactNativeError } from './errors/UseReactNativeError'
import { ViewEngine, ViewRoot } from '@stone-js/use-view'

/**
 * React Native implementation of the agnostic `ViewEngine` contract.
 *
 * The web engine mounts into a DOM element; there is no element tree here, so the host is
 * the screen stack, which is exactly why the contract's host became generic. Mounting means
 * putting a screen on the stack, and the returned handle updates or pops that screen.
 *
 * `renderToString` is the one part of the contract a phone cannot honour: there is no HTML
 * to produce and nobody to send it to. It refuses loudly rather than returning something
 * meaningless, so a misconfigured application (SSR asked of a native build) says so.
 */
export const NativeViewEngine: ViewEngine<ReactNode, ViewRoot, ScreenStack> = {
  createElement (component, props, ...children) {
    return reactCreateElement(component as Parameters<typeof reactCreateElement>[0], props ?? null, ...children)
  },

  renderToString () {
    throw new UseReactNativeError(
      'A native application cannot render to a string. Server-side rendering has no meaning on a device: check that this application is not configured for SSR or SSG.'
    )
  },

  mount (node, stack) {
    const screen = stack.navigate({ path: '/', element: node })

    return {
      update (next) {
        stack.navigate({ path: screen.path, element: next as ReactNode }, 'replace')
      },
      unmount () {
        stack.pop()
      }
    }
  },

  // A device has no server markup to adopt, so hydrating and mounting are the same act.
  // Kept distinct because the contract asks for both, and an engine that lies about which
  // one ran would make a rendering-mode bug much harder to see.
  async hydrate (node, stack) {
    return await NativeViewEngine.mount(node, stack)
  }
}
