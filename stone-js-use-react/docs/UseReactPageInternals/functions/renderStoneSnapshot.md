# Function: renderStoneSnapshot()

```ts
function renderStoneSnapshot(snapshot): string;
```

Render Stone snapshot into an inline script tag.

Delegates to `@stone-js/use-view`'s XSS-safe serializer: the snapshot JSON is escaped
(`< > &`, U+2028/U+2029) so user-controlled data returned by a page `handle()` cannot
break out of the `<script>` tag. The payload stays valid JSON for the client parser.

## Parameters

### snapshot

`string`

The snapshot JSON to render.

## Returns

`string`

The script tag.
