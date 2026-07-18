# Interface: RawBrowserResponseOptions

Represents options for configuring a raw browser response.

Extends the `RawResponseOptions` interface to include additional properties
for managing response rendering in the Browser.

## Extends

- `RawResponseOptions`

## Indexable

```ts
[k: string | number | symbol]: unknown
```

## Properties

### render()

```ts
render: () => Promiseable<void>;
```

The raw response object to send back to the Browser.

#### Returns

`Promiseable`\<`void`\>
