# Class: CookieCollection

Class representing a collection of Cookies.

## Constructors

### Constructor

```ts
protected new CookieCollection(
   cookie?, 
   options?, 
   secret?): CookieCollection;
```

Create a CookieCollection.

#### Parameters

##### cookie?

`string`

String cookie from header.

##### options?

[`CookieOptions`](../../../declarations/interfaces/CookieOptions.md) = `{}`

Cookies options.

##### secret?

`string`

Secret value to sign and unsign cookies.

#### Returns

`CookieCollection`

## Methods

### add()

```ts
add(
   name, 
   value, 
   options): this;
```

Add a cookie to the collection.

#### Parameters

##### name

`string`

Cookie name.

##### value

`unknown`

Cookie value.

##### options

[`CookieOptions`](../../../declarations/interfaces/CookieOptions.md) = `{}`

Cookie options.

#### Returns

`this`

***

### all()

```ts
all<S>(serialize): S extends true ? string[] : Record<string, unknown>;
```

Get all cookies in the collection.

#### Type Parameters

##### S

`S` *extends* `boolean`

#### Parameters

##### serialize

`S` = `...`

If true, serialize the cookies.

#### Returns

`S` *extends* `true` ? `string`[] : `Record`\<`string`, `unknown`\>

***

### clear()

```ts
clear(force): this;
```

Clear all cookies from the collection.

#### Parameters

##### force

`boolean` = `false`

If true, remove only from collection without setting expiry.

#### Returns

`this`

***

### get()

Get a cookie from the collection.

#### Param

Cookie name.

#### Param

Fallback value if the cookie does not exist.

#### Call Signature

```ts
get(name): undefined | Cookie;
```

Get a cookie from the collection.

##### Parameters

###### name

`string`

Cookie name.

##### Returns

`undefined` \| [`Cookie`](../../Cookie/classes/Cookie.md)

Cookie value.

##### Param

Cookie name.

##### Param

Fallback value if the cookie does not exist.

#### Call Signature

```ts
get(name, fallback): Cookie;
```

Get a cookie from the collection.

##### Parameters

###### name

`string`

Cookie name.

###### fallback

[`Cookie`](../../Cookie/classes/Cookie.md)

Fallback value if the cookie does not exist.

##### Returns

[`Cookie`](../../Cookie/classes/Cookie.md)

Cookie value.

##### Param

Cookie name.

##### Param

Fallback value if the cookie does not exist.

***

### getValue()

Get a cookie value from the collection.

#### Param

Cookie name.

#### Param

Fallback value if the cookie does not exist.

#### Call Signature

```ts
getValue<ValueType>(name): undefined | ValueType;
```

Get a cookie value from the collection.

##### Type Parameters

###### ValueType

`ValueType` = `unknown`

##### Parameters

###### name

`string`

Cookie name.

##### Returns

`undefined` \| `ValueType`

Cookie value.

##### Param

Cookie name.

##### Param

Fallback value if the cookie does not exist.

#### Call Signature

```ts
getValue<ValueType>(name, fallback): ValueType;
```

Get a cookie value from the collection.

##### Type Parameters

###### ValueType

`ValueType` = `unknown`

##### Parameters

###### name

`string`

Cookie name.

###### fallback

`ValueType`

Fallback value if the cookie does not exist.

##### Returns

`ValueType`

Cookie value.

##### Param

Cookie name.

##### Param

Fallback value if the cookie does not exist.

***

### has()

```ts
has(name): boolean;
```

Check if the collection has a cookie.

#### Parameters

##### name

`string`

Cookie name.

#### Returns

`boolean`

***

### isEmpty()

```ts
isEmpty(): boolean;
```

Check if the collection is empty.

#### Returns

`boolean`

***

### remove()

```ts
remove(
   name, 
   options, 
   force): this;
```

Remove a cookie from the collection.

#### Parameters

##### name

`string`

Cookie name to remove.

##### options

[`CookieOptions`](../../../declarations/interfaces/CookieOptions.md) = `{}`

Cookie options.

##### force

`boolean` = `false`

If true, remove only from collection without setting expiry.

#### Returns

`this`

***

### secure()

```ts
secure(value): this;
```

Set secure flag for all cookies in the collection.

#### Parameters

##### value

`boolean` = `false`

Whether the cookies are secure.

#### Returns

`this`

***

### setOptions()

```ts
setOptions(options): this;
```

Set options for all cookies in the collection.

#### Parameters

##### options

[`CookieOptions`](../../../declarations/interfaces/CookieOptions.md)

Cookie options.

#### Returns

`this`

***

### setSecret()

```ts
setSecret(value): this;
```

Set secret for signing and unsigning cookies.

#### Parameters

##### value

`string`

Secret value.

#### Returns

`this`

***

### update()

```ts
update(
   name, 
   value, 
   options): this;
```

Update a cookie in the collection.

#### Parameters

##### name

`string`

Cookie name.

##### value

`unknown`

New cookie value.

##### options

[`CookieOptions`](../../../declarations/interfaces/CookieOptions.md) = `{}`

Cookie options.

#### Returns

`this`

***

### create()

```ts
static create(
   cookie?, 
   options?, 
   secret?): CookieCollection;
```

Create a CookieCollection.

#### Parameters

##### cookie?

`string`

String cookie from header.

##### options?

[`CookieOptions`](../../../declarations/interfaces/CookieOptions.md) = `{}`

Cookies options.

##### secret?

`string`

Secret value to sign and unsign cookies.

#### Returns

`CookieCollection`
