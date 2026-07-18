# Interface: Options

Options for retrieving environment variables.

## Properties

### default?

```ts
optional default: any;
```

The default value if the environment variable is not set.

***

### enums?

```ts
optional enums: string[];
```

An array of allowed values for enum types.

***

### format?

```ts
optional format: "email" | "host" | "url";
```

The format of the environment variable if it's a string. Can be 'url', 'host', or 'email'.

***

### optional?

```ts
optional optional: boolean;
```

Whether the environment variable is optional.

***

### protocol?

```ts
optional protocol: boolean;
```

Whether a protocol is required for URLs.

***

### separator?

```ts
optional separator: string;
```

The separator for parsing array or object values (default is ',').

***

### tld?

```ts
optional tld: boolean;
```

Whether a top-level domain is required for URLs or emails.

***

### type?

```ts
optional type: 
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "json"
  | "enum"
  | "email"
  | "host"
  | "url";
```

The type of the environment variable. Can be 'number', 'boolean', 'array', 'object', 'json', 'enum', 'email', 'host', 'url', or 'string'.
