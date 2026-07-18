# Interface: PrerenderResult

The output of pre-rendering a single [PrerenderTarget](PrerenderTarget.md).

## Properties

### head?

```ts
optional head?: string;
```

The serialized head (already included in `html`; exposed for tooling).

***

### html

```ts
html: string;
```

The full HTML document to write (e.g. to `dist/<path>/index.html`).

***

### path

```ts
path: string;
```

The target path.

***

### statusCode

```ts
statusCode: number;
```

The status code the page resolved to (200, 404, …).
