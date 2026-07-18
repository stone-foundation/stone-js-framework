# Interface: PrerenderPageOptions

Options for [prerenderPage](../functions/prerenderPage.md).

## Properties

### head?

```ts
optional head?: HeadContext;
```

The page's resolved head context.

***

### node

```ts
node: ReactNode;
```

The fully-built React tree for the page (layout + page + providers).

***

### path

```ts
path: string;
```

The route path being generated (e.g. `/blog/hello-world`).

***

### snapshot?

```ts
optional snapshot?: Record<string, unknown>;
```

The hydration snapshot to embed (defaults to `{ ssr: true }`).

***

### statusCode?

```ts
optional statusCode?: number;
```

The resolved status code (defaults to 200).

***

### template

```ts
template: string;
```

The HTML template containing `<!--app-html-->` and `<!--app-head-->` placeholders.
