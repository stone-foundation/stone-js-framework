# Interface: IRoute

Describes a route definition, including its URI, method, and parameters.

## Properties

### getOptions

```ts
getOptions: <TReturn>(keys) => Record<string, TReturn>;
```

#### Type Parameters

##### TReturn

`TReturn` = `unknown`

#### Parameters

##### keys

`string`[]

#### Returns

`Record`\<`string`, `TReturn`\>

***

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

### method

```ts
method: HttpMethod;
```

***

### params

```ts
params: Record<string, unknown>;
```

***

### uri

```ts
uri: string;
```
