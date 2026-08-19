import { BindingValue, defineServiceProvider, IContainer, StoneBlueprint } from '@stone-js/core'

/** What a test substitutes into the container: a value or instance, by alias. */
export type TestBindings = Record<string, BindingValue>

/**
 * A provider that substitutes bindings in the container.
 *
 * Overriding through a provider rather than through a back door means the substitution happens where
 * every other registration happens, in the container the kernel builds for each event. A fake stays
 * a fake for the whole dispatch, and the code under test resolves it exactly as it resolves the real
 * one: nothing in the application knows it is being tested.
 *
 * Registered after the application's own providers, so the fake wins over what it replaces. It binds
 * unconditionally for the same reason: substituting is the entire point.
 *
 * @param bindings - The values to bind, by alias.
 * @returns A blueprint fragment registering the provider.
 */
export function testBindingsProvider (bindings: TestBindings): Partial<StoneBlueprint> {
  return defineServiceProvider((container: IContainer) => ({
    register: () => {
      for (const [alias, value] of Object.entries(bindings)) {
        container.instance(alias, value)
      }
    }
  }))
}
