# Type Alias: HeadersType

```ts
type HeadersType = 
  | Headers
  | Map<string, string | string[]>
| Record<string, string | string[]>;
```

Represents the type of HTTP headers.

It supports standard Fetch API `Headers`, `Map` of string keys and values, or a plain object.
