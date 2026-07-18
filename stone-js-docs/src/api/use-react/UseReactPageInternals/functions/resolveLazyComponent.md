# Function: resolveLazyComponent()

```ts
function resolveLazyComponent(metaComponent?): Promise<
  | undefined
  | MetaPageLayout
  | MetaPage<ReactIncomingEvent, unknown>
  | MetaErrorPage<ReactIncomingEvent, unknown>
| MetaAdapterErrorPage<any, any, any>>;
```

Resolve lazy loaded components.

## Parameters

### metaComponent?

The meta component event handler.

[`MetaPageLayout`](../../declarations/interfaces/MetaPageLayout.md) | [`MetaPage`](../../declarations/interfaces/MetaPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\> | [`MetaErrorPage`](../../declarations/interfaces/MetaErrorPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\> | [`MetaAdapterErrorPage`](../../declarations/interfaces/MetaAdapterErrorPage.md)\<`any`, `any`, `any`\>

## Returns

`Promise`\<
  \| `undefined`
  \| [`MetaPageLayout`](../../declarations/interfaces/MetaPageLayout.md)
  \| [`MetaPage`](../../declarations/interfaces/MetaPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\>
  \| [`MetaErrorPage`](../../declarations/interfaces/MetaErrorPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\>
  \| [`MetaAdapterErrorPage`](../../declarations/interfaces/MetaAdapterErrorPage.md)\<`any`, `any`, `any`\>\>

The resolved element type.
