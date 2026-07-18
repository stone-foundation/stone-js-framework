# Function: resolveLazyComponent()

```ts
function resolveLazyComponent(metaComponent?): Promise<
  | MetaPageLayout
  | MetaPage<ReactIncomingEvent, unknown>
  | MetaErrorPage<ReactIncomingEvent, unknown>
  | MetaAdapterErrorPage<any, any, any>
| undefined>;
```

Resolve lazy loaded components.

## Parameters

### metaComponent?

  \| [`MetaPageLayout`](../../declarations/interfaces/MetaPageLayout.md)
  \| [`MetaPage`](../../declarations/interfaces/MetaPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\>
  \| [`MetaErrorPage`](../../declarations/interfaces/MetaErrorPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\>
  \| [`MetaAdapterErrorPage`](../../declarations/interfaces/MetaAdapterErrorPage.md)\<`any`, `any`, `any`\>

The meta component event handler.

## Returns

`Promise`\<
  \| [`MetaPageLayout`](../../declarations/interfaces/MetaPageLayout.md)
  \| [`MetaPage`](../../declarations/interfaces/MetaPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\>
  \| [`MetaErrorPage`](../../declarations/interfaces/MetaErrorPage.md)\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), `unknown`\>
  \| [`MetaAdapterErrorPage`](../../declarations/interfaces/MetaAdapterErrorPage.md)\<`any`, `any`, `any`\>
  \| `undefined`\>

The resolved element type.
