# Interface: IAdapterEventBuilder\<TValues, UResponse\>

IAdapterEventBuilder Interface.

Interface representing a builder for adapters that provides methods for adding properties and building the resulting object.

## Template

UResponse

## Type Parameters

### TValues

`TValues`

### UResponse

`UResponse`

## Properties

### add()

```ts
add: (key, value) => this;
```

#### Parameters

##### key

keyof `TValues`

##### value

`TValues`\[keyof `TValues`\]

#### Returns

`this`

***

### addIf()

```ts
addIf: (key, value) => this;
```

#### Parameters

##### key

keyof `TValues`

##### value

`TValues`\[keyof `TValues`\]

#### Returns

`this`

***

### build()

```ts
build: () => UResponse;
```

#### Returns

`UResponse`

***

### options

```ts
readonly options: TValues;
```
