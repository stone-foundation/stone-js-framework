# Function: useRawEvent()

```ts
function useRawEvent<TRawEvent>(): TRawEvent | undefined;
```

Access the raw, platform-specific event that produced this render.

This is the untouched native event captured by the adapter (e.g. Node's
`IncomingMessage`, the AWS Lambda event, or the browser event). Returns `undefined`
when the adapter did not attach one. Prefer [useEvent](useEvent.md) for normalised access;
reach for the raw event only for platform-specific needs.

## Type Parameters

### TRawEvent

`TRawEvent` = `unknown`

The expected raw event type.

## Returns

`TRawEvent` \| `undefined`

The raw event, or `undefined`.
