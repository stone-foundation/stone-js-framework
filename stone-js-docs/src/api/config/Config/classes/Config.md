# Class: Config\<TObject\>

Class representing a Config.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- [`Proxiable`](../../Proxiable/classes/Proxiable.md)

## Type Parameters

### TObject

`TObject` *extends* `object` = `Record`\<`PropertyKey`, `unknown`\>

## Constructors

### Constructor

```ts
protected new Config<TObject>(items?): Config<TObject>;
```

Create a Config.

#### Parameters

##### items?

`any`

Initial configuration items.

#### Returns

`Config`\<`TObject`\>

#### Overrides

[`Proxiable`](../../Proxiable/classes/Proxiable.md).[`constructor`](../../Proxiable/classes/Proxiable.md#constructor)

## Methods

### add()

```ts
add<TValue>(key, value): this;
```

Add a value to an existing configuration key.

#### Type Parameters

##### TValue

`TValue`

#### Parameters

##### key

`PropertyKey`

The key or keys to set as defaults.

##### value

`TValue`

The value to set as default.

#### Returns

`this`

The current Config instance.

***

### all()

```ts
all(): TObject;
```

Get all of the configuration items as a literal object.

#### Returns

`TObject`

All configuration items.

***

### clear()

```ts
clear(): this;
```

Clear all of the configuration items.

#### Returns

`this`

The current Config instance.

***

### firstMatch()

Get the first match configuration value.

#### Param

An array of keys to check.

#### Param

The fallback value if no key matches.

#### Call Signature

```ts
firstMatch<TReturn>(keys): undefined | TReturn;
```

Get the first match configuration value.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### keys

`PropertyKey`[]

An array of keys to check.

##### Returns

`undefined` \| `TReturn`

The first matching configuration value.

##### Param

An array of keys to check.

##### Param

The fallback value if no key matches.

#### Call Signature

```ts
firstMatch<TReturn>(keys, fallback): TReturn;
```

Get the first match configuration value.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### keys

`PropertyKey`[]

An array of keys to check.

###### fallback

`TReturn`

The fallback value if no key matches.

##### Returns

`TReturn`

The first matching configuration value.

##### Param

An array of keys to check.

##### Param

The fallback value if no key matches.

***

### get()

Get the specified configuration value.

#### Param

The key or keys to retrieve from the configuration.

#### Param

The fallback value if the key does not exist.

#### Call Signature

```ts
get<TReturn>(key): undefined | TReturn;
```

Get the specified configuration value.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

`PropertyKey`

The key or keys to retrieve from the configuration.

##### Returns

`undefined` \| `TReturn`

The configuration value.

##### Param

The key or keys to retrieve from the configuration.

##### Param

The fallback value if the key does not exist.

#### Call Signature

```ts
get<TReturn>(key, fallback): TReturn;
```

Get the specified configuration value.

##### Type Parameters

###### TReturn

`TReturn` = `unknown`

##### Parameters

###### key

`PropertyKey`

The key or keys to retrieve from the configuration.

###### fallback

`TReturn`

The fallback value if the key does not exist.

##### Returns

`TReturn`

The configuration value.

##### Param

The key or keys to retrieve from the configuration.

##### Param

The fallback value if the key does not exist.

***

### getMany()

```ts
getMany<TReturn>(keys): TReturn;
```

Get many configuration values.

#### Type Parameters

##### TReturn

`TReturn` = `Record`\<`PropertyKey`, `unknown`\>

#### Parameters

##### keys

The keys to retrieve from the configuration.

`Record`\<`PropertyKey`, `unknown`\> | `PropertyKey`[]

#### Returns

`TReturn`

An object containing the requested configuration values.

***

### has()

```ts
has(key): boolean;
```

Determine if the given configuration value exists.

#### Parameters

##### key

The key or keys to check.

`PropertyKey` | `PropertyKey`[]

#### Returns

`boolean`

True if the key exists, false otherwise.

***

### is()

```ts
is(key, value): boolean;
```

Check if the given configuration value is equal to the specified value.

#### Parameters

##### key

`PropertyKey`

The key to check.

##### value

`unknown`

The value to compare against.

#### Returns

`boolean`

True if the key's value is equal to the specified value, false otherwise.

***

### set()

```ts
set<TValue>(key, value?): this;
```

Set a given configuration value.

#### Type Parameters

##### TValue

`TValue`

#### Parameters

##### key

The key or keys to set in the configuration.

`PropertyKey` | `PropertyKey`[] | `Record`\<`string`, `TValue`\> | `Record`\<`PropertyKey`, `TValue`\>

##### value?

`TValue`

The value to set.

#### Returns

`this`

The current Config instance.

***

### setIf()

```ts
setIf<TValue>(key, value?): this;
```

Set a given configuration value if it does not exist.

#### Type Parameters

##### TValue

`TValue`

#### Parameters

##### key

The key or keys to set in the configuration.

`PropertyKey` | `PropertyKey`[]

##### value?

`TValue`

The value to set.

#### Returns

`this`

The current Config instance.

***

### setItems()

```ts
setItems(items): this;
```

Set all of the configuration items.

#### Parameters

##### items

`TObject`

The configuration items.

#### Returns

`this`

The current Config instance.

***

### toJson()

```ts
toJson(): string;
```

Get all of the configuration items as a JSON string.

#### Returns

`string`

All configuration items as a JSON string.

***

### create()

```ts
static create<TObject>(items?): Config<TObject>;
```

Create a Config.

#### Type Parameters

##### TObject

`TObject` *extends* `object` = `Record`\<`PropertyKey`, `unknown`\>

#### Parameters

##### items?

`TObject`

Initial configuration items.

#### Returns

`Config`\<`TObject`\>

A new Config instance.

***

### fromJson()

```ts
static fromJson<TObject>(items): Config<TObject>;
```

Create a Config from a JSON string.

#### Type Parameters

##### TObject

`TObject` *extends* `object` = `Record`\<`PropertyKey`, `unknown`\>

#### Parameters

##### items

`string`

The JSON string to create the Config from.

#### Returns

`Config`\<`TObject`\>

A new Config instance.
