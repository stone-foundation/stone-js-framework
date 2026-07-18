# Class: OutgoingBrowserResponse

## Extends

- `OutgoingResponse`

## Extended by

- [`RedirectBrowserResponse`](../../RedirectBrowserResponse/classes/RedirectBrowserResponse.md)

## Constructors

### Constructor

```ts
new OutgoingBrowserResponse(options): OutgoingBrowserResponse;
```

Constructor for OutgoingBrowserResponse.
Initializes headers and cookies based on the provided options.

#### Parameters

##### options

[`OutgoingBrowserResponseOptions`](../interfaces/OutgoingBrowserResponseOptions.md)

Options for the outgoing browser response.

#### Returns

`OutgoingBrowserResponse`

#### Overrides

```ts
OutgoingResponse.constructor
```

## Properties

### OUTGOING\_BROWSER\_RESPONSE

```ts
static OUTGOING_BROWSER_RESPONSE: string = 'stonejs@outgoing_browser_response';
```

## Methods

### is1xx()

```ts
is1xx(): boolean;
```

Check if the status code represents an informational response (1xx).

#### Returns

`boolean`

True if the status code is informational, otherwise false.

***

### is2xx()

```ts
is2xx(): boolean;
```

Check if the status code represents a successful response (2xx).

#### Returns

`boolean`

True if the status code is successful, otherwise false.

***

### is3xx()

```ts
is3xx(): boolean;
```

Check if the status code represents a redirection response (3xx).

#### Returns

`boolean`

True if the status code is a redirection, otherwise false.

***

### is4xx()

```ts
is4xx(): boolean;
```

Check if the status code represents a client error response (4xx).

#### Returns

`boolean`

True if the status code is a client error, otherwise false.

***

### is5xx()

```ts
is5xx(): boolean;
```

Check if the status code represents a server error response (5xx).

#### Returns

`boolean`

True if the status code is a server error, otherwise false.

***

### isError()

```ts
isError(): boolean;
```

Check if the status code is an error (i.e., 4xx or 5xx).

#### Returns

`boolean`

True if the status code is an error, otherwise false.

***

### isForbidden()

```ts
isForbidden(): boolean;
```

Check if the status code is 403 (Forbidden).

#### Returns

`boolean`

True if the status code is 403, otherwise false.

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

***

### isInvalid()

```ts
isInvalid(): boolean;
```

Check if the status code is invalid.

#### Returns

`boolean`

True if the status code is invalid, otherwise false.

***

### isNotError()

```ts
isNotError(): boolean;
```

Check if the status code is not an error (i.e., not 4xx or 5xx).

#### Returns

`boolean`

True if the status code is not an error, otherwise false.

***

### isNotFound()

```ts
isNotFound(): boolean;
```

Check if the status code is 404 (Not Found).

#### Returns

`boolean`

True if the status code is 404, otherwise false.

***

### isOk()

```ts
isOk(): boolean;
```

Check if the status code is 200 (OK).

#### Returns

`boolean`

True if the status code is 200, otherwise false.

***

### isUnauthorized()

```ts
isUnauthorized(): boolean;
```

Check if the status code is 401 (Unauthorized).

#### Returns

`boolean`

True if the status code is 401, otherwise false.

***

### create()

```ts
static create(options): OutgoingBrowserResponse;
```

Create an instance of OutgoingBrowserResponse.

#### Parameters

##### options

[`OutgoingBrowserResponseOptions`](../interfaces/OutgoingBrowserResponseOptions.md)

Options for the outgoing browser response.

#### Returns

`OutgoingBrowserResponse`

A new instance of OutgoingBrowserResponse.

#### Overrides

```ts
OutgoingResponse.create
```
