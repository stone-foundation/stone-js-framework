/**
 * The platform-independent half of this integration, re-exported so the public surface of
 * `@stone-js/use-react` is unchanged by the split.
 *
 * Page and layout contracts, decorators, hooks, context, view providers and the render
 * orchestration now live in `@stone-js/use-react-core`, because the native renderer needs
 * exactly the same things and neither of them should own them. Your imports do not move:
 * everything you imported from `@stone-js/use-react` still comes from
 * `@stone-js/use-react`.
 *
 * A single `export *`, deliberately: the published declaration barrel is assembled from
 * every file in `src/`, and two files exporting the same name would drop it from the barrel
 * silently rather than fail the build.
 */
export * from '@stone-js/use-react-core'
