# Interface: StreamRenderOptions

Options for streaming render.

## Properties

### bootstrapModules?

```ts
optional bootstrapModules?: string[];
```

Bootstrap module scripts to start hydration on the client.

***

### head?

```ts
optional head?: string;
```

Markup injected into the stream head (before the app shell), e.g. the serialized head.

***

### nonce?

```ts
optional nonce?: string;
```

Nonce for CSP.

***

### onShellError?

```ts
optional onShellError?: (error) => void;
```

Called if the shell errored.

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### onShellReady?

```ts
optional onShellReady?: () => void;
```

Called when the shell is ready (before streaming Suspense content).

#### Returns

`void`

***

### signal?

```ts
optional signal?: AbortSignal;
```

Abort signal to cancel the stream.

***

### tail?

```ts
optional tail?: string;
```

Markup appended after the app shell (e.g. the hydration snapshot script).
