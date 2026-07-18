# Function: buildLayoutComponent()

```ts
function buildLayoutComponent(
   container, 
   children, 
layoutName?): Promise<ReactNode>;
```

Get response layout in the current route for mutli pages application.
Or get it from the blueprint configuration for single page application.
Or get the default layout defined by the user.
If not defined, return undefined.

## Parameters

### container

`Container`

Service Container.

### children

`ReactNode`

The children to render.

### layoutName?

`unknown`

The layout name.

## Returns

`Promise`\<`ReactNode`\>

The resolved layout element.
