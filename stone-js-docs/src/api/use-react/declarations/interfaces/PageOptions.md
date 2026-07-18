# Interface: PageOptions

Options for configuring the `Page` decorator.
Extends `PageRouteDefinition` but excludes the `methods` property,
as it is predefined as `'GET'` by the decorator.

## Extends

- `DecoratorPageRouteDefinition`

## Indexable

```ts
[key: string]: unknown
```

```ts
[key: number]: unknown
```

## Properties

### headers?

```ts
optional headers: HeadersType;
```

***

### layout?

```ts
optional layout: string;
```
