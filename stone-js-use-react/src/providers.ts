/**
 * Design-system & provider integration for React apps.
 *
 * A **view provider** is any component that must wrap the whole application tree (SSR and CSR):
 * a design-system theme provider (MUI, Chakra, NoowowDesign System…), an i18n provider, a
 * store provider, etc. Tailwind / plain-CSS design systems need none of this — they are just a
 * stylesheet import handled by the CLI's Vite pipeline.
 *
 * There are two ways to register a provider; both feed the SAME blueprint key
 * (`stone.useReact.providers`), which the CLI assembles at build time and `buildAppComponent`
 * composes around the app root (outermost-first by ascending `priority`).
 *
 * ## 1. Imperative — `defineViewProvider` (best for library components & DI-aware factories)
 *
 * The app's blueprint is produced by the CLI, which runs every blueprint config and blueprint
 * middleware. A `defineBlueprintConfig` block therefore runs at build time; `blueprint.add`
 * appends to the providers list:
 *
 * ```ts
 * import { defineBlueprintConfig } from '@stone-js/core'
 * import { defineViewProvider } from '@stone-js/use-react'
 * import { ThemeProvider, theme } from '@noowow/design-system'
 *
 * export const AppConfig = defineBlueprintConfig((blueprint) => {
 *   blueprint.add('stone.useReact.providers', [
 *     defineViewProvider(ThemeProvider, { priority: 10, props: { theme } })
 *   ])
 * })
 * ```
 *
 * For a DI-aware provider, register a factory (it receives the container at compose time):
 *
 * ```ts
 * defineViewProvider((container) => container.make('themeProvider'), { isFactory: true })
 * ```
 *
 * ## 2. Declarative — `@ViewProvider` (best for app-authored provider components)
 *
 * Decorate a React component class; the CLI's `SetReactViewProvidersMiddleware` discovers it
 * among the build's modules and adds it to the same list — no blueprint code needed:
 *
 * ```tsx
 * import { Component, ReactNode } from 'react'
 * import { ViewProvider } from '@stone-js/use-react'
 * import { ThemeProvider, theme } from '@noowow/design-system'
 *
 * @ViewProvider({ priority: 10 })
 * export class AppThemeProvider extends Component<{ children: ReactNode }> {
 *   render () {
 *     return <ThemeProvider theme={theme}>{this.props.children}</ThemeProvider>
 *   }
 * }
 * ```
 *
 * Both approaches are interchangeable and can be mixed; ordering is always by `priority`.
 */
export {
  defineViewProvider,
  isViewProvider,
  composeProviders
} from '@stone-js/use-view'

export { ViewProvider } from './decorators/ViewProvider'

export type {
  MetaViewProvider,
  ViewProviderOptions
} from '@stone-js/use-view'
