# Class: BrowserResponseMiddleware

Adapter Middleware for handling outgoing responses and rendering them in the browser.

## Constructors

### Constructor

```ts
new BrowserResponseMiddleware(options): BrowserResponseMiddleware;
```

Create a BrowserResponseMiddleware.

#### Parameters

##### options

Options for creating the BrowserResponseMiddleware.

###### blueprint

`IBlueprint`

#### Returns

`BrowserResponseMiddleware`

## Methods

### handle()

```ts
handle(context, next): Promise<BrowserAdapterResponseBuilder>;
```

Handles the outgoing response, processes it, and invokes the next middleware in the pipeline.

#### Parameters

##### context

[`ReactBrowserAdapterContext`](../../../../declarations/type-aliases/ReactBrowserAdapterContext.md)

The adapter context containing the raw event, execution context, and other data.

##### next

`NextMiddleware`\<[`ReactBrowserAdapterContext`](../../../../declarations/type-aliases/ReactBrowserAdapterContext.md), `BrowserAdapterResponseBuilder`\>

The next middleware to be invoked in the pipeline.

#### Returns

`Promise`\<`BrowserAdapterResponseBuilder`\>

A promise resolving to the processed context.

#### Throws

If required components are missing in the context.
