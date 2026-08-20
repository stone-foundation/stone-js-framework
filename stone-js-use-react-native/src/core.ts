/**
 * The shared half of the React integration, re-exported.
 *
 * A page, a layout, an error page, a view provider and every platform-independent hook are
 * declared exactly as they are on the web, so a component imports them from the renderer it
 * runs on and nothing else changes. `@stone-js/use-react` does the same, which is what makes
 * a screen and a page the same kind of thing.
 *
 * A single `export *`, deliberately: the published declaration barrel is assembled from every
 * file in `src/`, and two files exporting the same name would drop it from the barrel
 * silently rather than fail the build.
 */
export * from '@stone-js/use-react-core'
