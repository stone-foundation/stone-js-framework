# Class: Cookie

Class representing a Cookie.

## Constructors

### Constructor

```ts
protected new Cookie(
   name, 
   value, 
   options): Cookie;
```

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

`Cookie`

## Properties

### name

```ts
readonly name: string;
```

***

### options

```ts
readonly options: CookieOptions;
```

***

### value

```ts
readonly value: unknown;
```

## Methods

### cloneWith()

```ts
cloneWith(value, options): Cookie;
```

Clone the cookie with new name, value, and options.

#### Parameters

##### value

`unknown`

New cookie value.

##### options

[`CookieOptions`](../../../declarations/interfaces/CookieOptions.md) = `{}`

New cookie options.

#### Returns

`Cookie`

A new cookie instance.

***

### getValue()

```ts
getValue<ValueType>(): ValueType;
```

Get the cookie value.

#### Type Parameters

##### ValueType

`ValueType` = `unknown`

#### Returns

`ValueType`

The cookie value.

***

### serialize()

```ts
serialize(secret?): string;
```

Serialize the cookie value.

#### Parameters

##### secret?

`string`

Optional secret for signing.

#### Returns

`string`

***

### setExpires()

```ts
setExpires(value): this;
```

Set expiration date for the cookie.

#### Parameters

##### value

`Date`

Expiration date.

#### Returns

`this`

***

### setSecure()

```ts
setSecure(value): this;
```

Set secure flag for the cookie.

#### Parameters

##### value

`boolean`

Whether the cookie is secure.

#### Returns

`this`

***

### create()

```ts
static create(
   name, 
   value, 
   options): Cookie;
```

Create a Cookie.

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

`Cookie`
