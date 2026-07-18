# Function: ViewProvider()

```ts
function ViewProvider<T>(options?): ClassDecorator;
```

A class decorator that registers a component as a **view provider**: a wrapper mounted
around the whole application tree (SSR and CSR) — a design-system theme provider, an i18n
provider, a store provider, etc.

This is the declarative counterpart of the imperative `defineViewProvider`. The CLI's
blueprint middleware discovers every `@ViewProvider` class at build time and adds it to
`stone.useReact.providers`, exactly as if it had been registered by hand — so you never
touch the blueprint directly. Tailwind/plain-CSS design systems need no provider at all
(they are just a stylesheet import); use this only for providers that must live in the tree.

Providers compose outermost-first by ascending `priority` (lower = outer).

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### options?

[`ViewProviderOptions`](../../../providers/interfaces/ViewProviderOptions.md) = `{}`

Composition order and props passed to the provider element.

## Returns

`ClassDecorator`

A class decorator.

The decorated class is used directly as a React component, so it must be a React class
component (receives `children` via props). For a plain function component from a library
(e.g. MUI `ThemeProvider`) or a DI-aware factory, register it imperatively with
`defineViewProvider` instead.

## Example

```tsx
import { Component, ReactNode } from 'react'
import { ThemeProvider } from '@noowow/design-system'
import { ViewProvider } from '@stone-js/use-react'

@ViewProvider({ priority: 10 })
export class AppThemeProvider extends Component<{ children: ReactNode }> {
  render () {
    return <ThemeProvider theme={theme}>{this.props.children}</ThemeProvider>
  }
}
```
