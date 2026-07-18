# Function: resolveComponent()

```ts
function resolveComponent<T>(container, metaComponent?): Promise<undefined | T>;
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

`Container`

The service container.

### metaComponent?

The meta component event handler.

[`MetaPageLayout`](../../declarations/interfaces/MetaPageLayout.md) | [`MetaPage`](../../declarations/interfaces/MetaPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\> | [`MetaErrorPage`](../../declarations/interfaces/MetaErrorPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\>

## Returns

`Promise`\<`undefined` \| `T`\>

The resolved element type.
