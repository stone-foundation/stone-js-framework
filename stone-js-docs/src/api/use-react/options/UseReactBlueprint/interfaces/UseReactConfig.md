# Interface: UseReactConfig

Configuration options for integrating React with Stone.js.

## Properties

### adapterErrorPages?

```ts
optional adapterErrorPages: Record<string, MetaAdapterErrorPage<unknown, unknown, unknown>>;
```

A map of error pages for adapter-level errors.

***

### componentEventHandler?

```ts
optional componentEventHandler: MetaPage<ReactIncomingEvent, unknown>;
```

Handles incoming events for the root React component.

***

### errorPages?

```ts
optional errorPages: Record<string, MetaErrorPage<ReactIncomingEvent, unknown>>;
```

A map of error pages for specific components.

***

### htmlTemplateContent?

```ts
optional htmlTemplateContent: string;
```

The content of the HTML template as a string.
This can be used to define the structure of the HTML document.
This is useful for inline templates or when the template is dynamically generated.
Note: This is not a file path, but the actual HTML content.

***

### ignorePlatforms?

```ts
optional ignorePlatforms: string[];
```

A list of platforms to ignore for React rendering.
This can be used to disable React rendering on specific platforms.
For example, you might want to ignore rendering on CLI platforms.

***

### layout?

```ts
optional layout: Record<string, MetaPageLayout>;
```

A map of layout components with their respective event handlers.

***

### rootElementId?

```ts
optional rootElementId: string;
```

The ID of the root DOM element where React will be mounted.
