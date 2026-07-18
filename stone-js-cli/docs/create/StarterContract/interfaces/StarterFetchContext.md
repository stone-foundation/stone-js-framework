# Interface: StarterFetchContext

Context for fetching/collecting starters.

## Properties

### cwd

```ts
cwd: string;
```

Current working directory (for local links and auto-detection).

***

### output

```ts
output: object;
```

Minimal logger.

#### info

```ts
info: (message) => void;
```

##### Parameters

###### message

`string`

##### Returns

`void`
