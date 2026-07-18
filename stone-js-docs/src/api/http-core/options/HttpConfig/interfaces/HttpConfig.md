# Interface: HttpConfig

Represents the core HTTP config options for the application.
HTTP configuration options that are commonly used across adapters.

## Properties

### body

```ts
body: object;
```

Configuration for request body parsing.

#### defaultCharset

```ts
defaultCharset: string;
```

The default character set for the request body.

#### defaultType

```ts
defaultType: string;
```

The content type of the request body.

#### limit

```ts
limit: string;
```

The maximum size of the request body.

***

### cache

```ts
cache: Record<string, any>;
```

Cache configuration options.

***

### cookie

```ts
cookie: object;
```

Cookie-related configuration options.

#### options

```ts
options: CookieOptions;
```

Additional cookie options.

#### secret

```ts
secret: string;
```

The secret used for signing cookies.

***

### cors

```ts
cors: HttpCorsConfig;
```

Cross-Origin Resource Sharing (CORS) configuration options.

***

### etag

```ts
etag: object;
```

ETag-related configuration options.

#### function()?

```ts
optional function: (content, encoding) => string;
```

A custom function for generating ETags.

##### Parameters

###### content

`string`

###### encoding

`Encoding`

##### Returns

`string`

***

### files

```ts
files: object;
```

File upload and response configuration options.

#### defaultCompressionEncoding

```ts
defaultCompressionEncoding: Record<string, string>;
```

The default encoding for compressed static files.

#### download

```ts
download: Record<string, any>;
```

Configuration for file responses.

#### extensions?

```ts
optional extensions: string[];
```

The list of accepted file extensions.

#### rootDir?

```ts
optional rootDir: string;
```

The root directory for serving static files.

#### upload

```ts
upload: Record<string, any>;
```

Configuration for file uploads.

***

### hosts

```ts
hosts: object;
```

Host-related configuration options.

#### onlySubdomain

```ts
onlySubdomain: boolean;
```

Whether only subdomains are allowed.

#### trusted

```ts
trusted: string[];
```

A list of trusted hostnames.

#### trustedPattern

```ts
trustedPattern: string[];
```

A list of trusted host patterns.

***

### json

```ts
json: HttpJsonConfig;
```

JSON-related configuration options.

***

### jsonp

```ts
jsonp: object;
```

JSONP-related configuration options.

#### callback

```ts
callback: object;
```

Configuration for the JSONP callback function.

##### callback.name

```ts
name: string;
```

The name of the JSONP callback parameter.

***

### proxies

```ts
proxies: object;
```

Proxy-related configuration options.

#### trustedIp

```ts
trustedIp: string[];
```

A list of trusted proxies.

#### untrustedIp

```ts
untrustedIp: string[];
```

A list of untrusted proxies.

***

### subdomain

```ts
subdomain: object;
```

Subdomain-related configuration options.

#### offset

```ts
offset: number;
```

The offset to use when determining subdomains.
