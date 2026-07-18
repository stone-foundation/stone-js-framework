# Interface: UseReactOptions

UseReact decorator options.

## Extends

- `Partial`\<[`UseReactConfig`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md)\>

## Properties

### adapterErrorPages?

```ts
optional adapterErrorPages?: Record<string, MetaAdapterErrorPage<unknown, unknown, unknown>>;
```

A map of error pages for adapter-level errors.

#### Inherited from

[`UseReactConfig`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md).[`adapterErrorPages`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md#adaptererrorpages)

***

### componentEventHandler?

```ts
optional componentEventHandler?: MetaPage<ReactIncomingEvent, unknown>;
```

Handles incoming events for the root React component.

#### Inherited from

[`UseReactConfig`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md).[`componentEventHandler`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md#componenteventhandler)

***

### errorPages?

```ts
optional errorPages?: Record<string, MetaErrorPage<ReactIncomingEvent, unknown>>;
```

A map of error pages for specific components.

#### Inherited from

[`UseReactConfig`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md).[`errorPages`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md#errorpages)

***

### htmlTemplateContent?

```ts
optional htmlTemplateContent?: string;
```

The content of the HTML template as a string.
This can be used to define the structure of the HTML document.
This is useful for inline templates or when the template is dynamically generated.
Note: This is not a file path, but the actual HTML content.

#### Inherited from

[`UseReactConfig`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md).[`htmlTemplateContent`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md#htmltemplatecontent)

***

### ignorePlatforms?

```ts
optional ignorePlatforms?: string[];
```

A list of platforms to ignore for React rendering.
This can be used to disable React rendering on specific platforms.
For example, you might want to ignore rendering on CLI platforms.

#### Inherited from

[`UseReactConfig`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md).[`ignorePlatforms`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md#ignoreplatforms)

***

### layout?

```ts
optional layout?: Record<string, MetaPageLayout>;
```

A map of layout components with their respective event handlers.

#### Inherited from

[`UseReactConfig`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md).[`layout`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md#layout)

***

### rootElementId?

```ts
optional rootElementId?: string;
```

The ID of the root DOM element where React will be mounted.

#### Inherited from

[`UseReactConfig`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md).[`rootElementId`](../../../../options/UseReactBlueprint/interfaces/UseReactConfig.md#rootelementid)
