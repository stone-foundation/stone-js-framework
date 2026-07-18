# Class: CookieCollection

Class representing a collection of Cookies.

## Constructors

### Constructor

```ts
protected new CookieCollection(
   cookie?, 
   options?, 
   domDocument?): CookieCollection;
```

Create a CookieCollection.

#### Parameters

##### cookie?

`string`

String cookie from header.

##### options?

[`CookieOptions`](../../../declarations/interfaces/CookieOptions.md) = `{}`

Cookies options.

##### domDocument?

`Document`

#### Returns

`CookieCollection`

## Methods

### add()

```ts
add(
   name, 
   value, 
   options?): this;
```

Add a cookie to the collection.

#### Parameters

##### name

`string`

Cookie name.

##### value

`unknown`

Cookie value.

##### options?

[`CookieOptions`](../../../declarations/interfaces/CookieOptions.md) = `{}`

Cookie options.

#### Returns

`this`

***

### all()

```ts
all(): Cookie[];
```

Get all cookies in the collection.

#### Returns

[`Cookie`](../../Cookie/classes/Cookie.md)[]

***

### clear()

```ts
clear(): this;
```

Clear all cookies from the collection.

#### Returns

`this`

***

### get()

Get a cookie from the collection.

#### Param

**name**

Cookie name.

#### Param

**fallback**

Fallback value if the cookie does not exist.

#### Call Signature

```ts
get(name): Cookie | undefined;
```

Get a cookie from the collection.

##### Parameters

###### name

`string`

Cookie name.

##### Returns

[`Cookie`](../../Cookie/classes/Cookie.md) \| `undefined`

Cookie value.

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

***

### getValue()

Get a cookie value from the collection.

#### Param

**name**

Cookie name.

#### Param

**fallback**

Fallback value if the cookie does not exist.

#### Call Signature

```ts
getValue<ValueType>(name): ValueType | undefined;
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

`ValueType` \| `undefined`

Cookie value.

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
remove(name, options?): this;
```

Remove a cookie from the collection.

#### Parameters

##### name

`string`

Cookie name to remove.

##### options?

[`CookieOptions`](../../../declarations/interfaces/CookieOptions.md) = `{}`

Cookie options.

#### Returns

`this`

***

### secure()

```ts
secure(value?): this;
```

Set secure flag for all cookies in the collection.

#### Parameters

##### value?

`boolean` = `true`

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

### update()

```ts
update(
   name, 
   value, 
   options?): this;
```

Update a cookie in the collection.

#### Parameters

##### name

`string`

Cookie name.

##### value

`unknown`

New cookie value.

##### options?

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
   domDocument?): CookieCollection;
```

Create a CookieCollection.

#### Parameters

##### cookie?

`string`

String cookie from header.

##### options?

[`CookieOptions`](../../../declarations/interfaces/CookieOptions.md) = `{}`

Cookies options.

##### domDocument?

`Document`

#### Returns

`CookieCollection`
