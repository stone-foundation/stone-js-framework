# Function: resolveComponent()

```ts
function resolveComponent<T>(container, metaComponent?): Promise<T | undefined>;
```

Resolve the event handler for the component.

Can also resolve dynamically loaded components.

## Type Parameters

### T

`T` = 
  \| [`IPageLayout`](../../declarations/interfaces/IPageLayout.md)
  \| [`IPage`](../../declarations/interfaces/IPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\>
  \| [`IErrorPage`](../../declarations/interfaces/IErrorPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\>

## Parameters

### container

`IContainer`

The service container.

### metaComponent?

  \| [`MetaPageLayout`](../../declarations/interfaces/MetaPageLayout.md)
  \| [`MetaPage`](../../declarations/interfaces/MetaPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\>
  \| [`MetaErrorPage`](../../declarations/interfaces/MetaErrorPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\>

The meta component event handler.

## Returns

`Promise`\<`T` \| `undefined`\>

The resolved element type.
