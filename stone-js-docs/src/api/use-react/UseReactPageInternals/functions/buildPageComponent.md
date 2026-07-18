# Function: buildPageComponent()

```ts
function buildPageComponent(
   event, 
   container, 
   component?, 
   data?, 
   statusCode?, 
   error?): ReactNode;
```

Get response component in the current route.
If not defined, return an empty object.

## Parameters

### event

[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md)

ReactIncomingEvent

### container

`Container`

Service Container

### component?

`ElementType`

The component response.

### data?

`any`

The data to pass to the component.

### statusCode?

`number`

The status code of the error.

### error?

`any`

The error object.

## Returns

`ReactNode`

The resolved component element.
