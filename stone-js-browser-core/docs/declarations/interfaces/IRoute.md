# Interface: IRoute

Represents a route.

## Properties

### getParam

```ts
getParam: <TReturn>(name, fallback?) => TReturn | undefined;
```

#### Type Parameters

##### TReturn

`TReturn` = `unknown`

#### Parameters

##### name

`string`

##### fallback?

`TReturn`

#### Returns

`TReturn` \| `undefined`

***

### params

```ts
params: Record<string, unknown>;
```
