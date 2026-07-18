# Interface: IRoute

Represents a route.

## Properties

### getParam()

```ts
getParam: <TReturn>(name, fallback?) => undefined | TReturn;
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

`undefined` \| `TReturn`

***

### params

```ts
params: Record<string, unknown>;
```
