# Class: RedirectBrowserResponse

Class representing a RedirectBrowserResponse.

## Author

Mr. Stone <evensstone@gmail.com>

## Extends

- [`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md)

## Constructors

### Constructor

```ts
new RedirectBrowserResponse(options): RedirectBrowserResponse;
```

Create a RedirectBrowserResponse.

#### Parameters

##### options

[`RedirectBrowserResponseOptions`](../interfaces/RedirectBrowserResponseOptions.md)

Options for creating the RedirectBrowserResponse.

#### Returns

`RedirectBrowserResponse`

#### Throws

HttpError if the status code is not a redirect code.

#### Overrides

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`constructor`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#constructor)

## Properties

### targetUrl?

```ts
readonly optional targetUrl: string | URL;
```

***

### OUTGOING\_BROWSER\_RESPONSE

```ts
static OUTGOING_BROWSER_RESPONSE: string = 'stonejs@redirect_browser_response';
```

#### Overrides

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`OUTGOING_BROWSER_RESPONSE`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#outgoing_browser_response)

## Methods

### is1xx()

```ts
is1xx(): boolean;
```

Check if the status code represents an informational response (1xx).

#### Returns

`boolean`

True if the status code is informational, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`is1xx`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#is1xx)

***

### is2xx()

```ts
is2xx(): boolean;
```

Check if the status code represents a successful response (2xx).

#### Returns

`boolean`

True if the status code is successful, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`is2xx`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#is2xx)

***

### is3xx()

```ts
is3xx(): boolean;
```

Check if the status code represents a redirection response (3xx).

#### Returns

`boolean`

True if the status code is a redirection, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`is3xx`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#is3xx)

***

### is4xx()

```ts
is4xx(): boolean;
```

Check if the status code represents a client error response (4xx).

#### Returns

`boolean`

True if the status code is a client error, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`is4xx`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#is4xx)

***

### is5xx()

```ts
is5xx(): boolean;
```

Check if the status code represents a server error response (5xx).

#### Returns

`boolean`

True if the status code is a server error, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`is5xx`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#is5xx)

***

### isError()

```ts
isError(): boolean;
```

Check if the status code is an error (i.e., 4xx or 5xx).

#### Returns

`boolean`

True if the status code is an error, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isError`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#iserror)

***

### isForbidden()

```ts
isForbidden(): boolean;
```

Check if the status code is 403 (Forbidden).

#### Returns

`boolean`

True if the status code is 403, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isForbidden`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isforbidden)

***

### isInStatusRange()

```ts
isInStatusRange(start, end): boolean;
```

Check if the status code falls within the specified range.

#### Parameters

##### start

`number`

The starting value of the range (inclusive).

##### end

`number`

The ending value of the range (exclusive).

#### Returns

`boolean`

True if the status code is within the specified range, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isInStatusRange`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isinstatusrange)

***

### isInvalid()

```ts
isInvalid(): boolean;
```

Check if the status code is invalid.

#### Returns

`boolean`

True if the status code is invalid, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isInvalid`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isinvalid)

***

### isNotError()

```ts
isNotError(): boolean;
```

Check if the status code is not an error (i.e., not 4xx or 5xx).

#### Returns

`boolean`

True if the status code is not an error, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isNotError`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isnoterror)

***

### isNotFound()

```ts
isNotFound(): boolean;
```

Check if the status code is 404 (Not Found).

#### Returns

`boolean`

True if the status code is 404, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isNotFound`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isnotfound)

***

### isOk()

```ts
isOk(): boolean;
```

Check if the status code is 200 (OK).

#### Returns

`boolean`

True if the status code is 200, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isOk`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isok)

***

### isUnauthorized()

```ts
isUnauthorized(): boolean;
```

Check if the status code is 401 (Unauthorized).

#### Returns

`boolean`

True if the status code is 401, otherwise false.

#### Inherited from

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`isUnauthorized`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#isunauthorized)

***

### create()

```ts
static create(options): RedirectBrowserResponse;
```

Create an instance of RedirectBrowserResponse.

#### Parameters

##### options

[`RedirectBrowserResponseOptions`](../interfaces/RedirectBrowserResponseOptions.md)

Options for the outgoing browser response.

#### Returns

`RedirectBrowserResponse`

A new instance of RedirectBrowserResponse.

#### Overrides

[`OutgoingBrowserResponse`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md).[`create`](../../OutgoingBrowserResponse/classes/OutgoingBrowserResponse.md#create)

***

### to()

```ts
static to(url, statusCode): RedirectBrowserResponse;
```

Create an instance of RedirectBrowserResponse from the given path or URL.

#### Parameters

##### url

The path or URL to redirect to. If a string is provided, it will be treated as a relative path.

`string` | `URL`

##### statusCode

`number` = `302`

The HTTP status code for the redirect (default is 302).

#### Returns

`RedirectBrowserResponse`

A new instance of RedirectBrowserResponse.
