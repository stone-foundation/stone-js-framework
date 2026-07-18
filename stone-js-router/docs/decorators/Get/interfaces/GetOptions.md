# Interface: GetOptions

Options for configuring the `Get` decorator.
Extends `DecoratorRouteDefinition` but excludes the `methods` property,
as it is predefined as `'GET'` by the decorator.

## Extends

- `Omit`\<[`DecoratorRouteDefinition`](../../../declarations/type-aliases/DecoratorRouteDefinition.md), `"methods"`\>

## Indexable

```ts
[key: string]: unknown
```

```ts
[key: number]: unknown
```
