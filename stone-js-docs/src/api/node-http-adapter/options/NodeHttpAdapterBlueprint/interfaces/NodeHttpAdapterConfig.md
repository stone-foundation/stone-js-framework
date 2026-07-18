# Interface: NodeHttpAdapterConfig

Represents the NodeHttpAdapter configuration options for the application.

## Extends

- `Partial`\<`AppConfig`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>\>

## Indexable

```ts
[key: string]: unknown
```

## Properties

### adapters

```ts
adapters: NodeHttpAdapterAdapterConfig[];
```

Adapter configurations for the application.
List of all adapters used in the application.

#### Overrides

```ts
Partial.adapters
```

***

### http

```ts
http: Partial<HttpConfig>;
```
