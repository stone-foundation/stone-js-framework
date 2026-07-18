# Interface: ErrorOptions

Represents options for configuring an error.

## Properties

### cause?

```ts
optional cause: Error;
```

The original error that caused this error, useful for error chaining.

***

### code?

```ts
optional code: string;
```

A specific error code for identifying the error.

***

### metadata?

```ts
optional metadata: unknown;
```

Additional information or context about the error.
