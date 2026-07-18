# Interface: PrerenderTarget\<ParamsType\>

A single unit of work for static generation: a route to pre-render at build time.

## Type Parameters

### ParamsType

`ParamsType` = `Record`\<`string`, `string`\>

The route params for a parameterized route.

## Properties

### params?

```ts
optional params?: ParamsType;
```

Route params (for parameterized routes).

***

### path

```ts
path: string;
```

The URL path to render (e.g. `/blog/hello-world`).
