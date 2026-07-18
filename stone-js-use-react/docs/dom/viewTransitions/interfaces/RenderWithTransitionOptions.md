# Interface: RenderWithTransitionOptions

Options controlling a transitional render.

## Properties

### doc?

```ts
optional doc?: ViewTransitionDocument;
```

Injected document (defaults to the global).

***

### enabled?

```ts
optional enabled?: boolean;
```

Whether View Transitions are allowed (default `true`).

***

### isNavigation?

```ts
optional isNavigation?: boolean;
```

Whether this render is a client navigation (transitions only wrap navigations, not the first paint/hydration).
